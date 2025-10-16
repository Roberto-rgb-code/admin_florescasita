import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { uploadImageToS3, deleteImageFromS3, isS3Available } from '@/lib/s3';

// GET /api/products/[id] - Obtener un producto
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const product = await getProductById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar un producto
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extraer datos del formulario
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const category = formData.get('category') as string;
    const badge = formData.get('badge') as string;
    const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : undefined;
    const is_active = formData.get('is_active') === 'true';
    const image = formData.get('image') as File | null;
    const image_url_form = formData.get('image_url') as string | null;
    const deleteOldImage = formData.get('deleteOldImage') === 'true';

    // Obtener producto actual
    const currentProduct = await getProductById(params.id);

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Manejar imagen
    let image_url = currentProduct.image_url;

    if (deleteOldImage && currentProduct.image_url && isS3Available()) {
      try {
        await deleteImageFromS3(currentProduct.image_url);
        image_url = null;
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    if (image && isS3Available()) {
      try {
        // Eliminar imagen anterior si existe
        if (currentProduct.image_url) {
          await deleteImageFromS3(currentProduct.image_url);
        }
        
        // Subir nueva imagen
        image_url = await uploadImageToS3(image, 'products');
      } catch (error) {
        console.error('Error uploading new image:', error);
      }
    } else if (image_url_form) {
      // Usar URL proporcionada (temporal mientras esperamos S3)
      image_url = image_url_form;
    }

    // Actualizar producto
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (price !== undefined) updateData.price = price;
    if (category) updateData.category = category;
    if (badge !== undefined) updateData.badge = badge || null;
    if (stock !== undefined) updateData.stock = stock;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (image_url !== currentProduct.image_url) updateData.image_url = image_url;

    const product = await updateProduct(params.id, updateData);

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar un producto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener producto para eliminar su imagen
    const product = await getProductById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar imagen de S3 si existe
    if (product.image_url && isS3Available()) {
      try {
        await deleteImageFromS3(product.image_url);
      } catch (error) {
        console.error('Error deleting product image:', error);
      }
    }

    // Eliminar producto
    await deleteProduct(params.id);

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
}
