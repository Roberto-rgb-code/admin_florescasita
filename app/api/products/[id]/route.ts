import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { uploadImageToSupabase, deleteImageFromSupabase, isSupabaseStorageAvailable } from '@/lib/supabase-storage';

// GET /api/products/[id] - Obtener un producto
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await getProductById(id);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const category = formData.get('category') as string;
    const badge = formData.get('badge') as string;
    const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : undefined;
    const is_active = formData.get('is_active') === 'true';
    const image_count = parseInt(formData.get('image_count') as string) || 0;
    const image_url_form = formData.get('image_url') as string | null;
    const deleteOldImage = formData.get('deleteOldImage') === 'true';

    // Obtener producto actual
    const currentProduct = await getProductById(id);

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Manejar imágenes
    let image_url = currentProduct.image_url;
    let additional_images = currentProduct.additional_images || [];

    // Eliminar imágenes anteriores si se solicita
    if (deleteOldImage && isSupabaseStorageAvailable()) {
      try {
        // Eliminar imagen principal
        if (currentProduct.image_url) {
          await deleteImageFromSupabase(currentProduct.image_url);
          image_url = null;
        }
        
        // Eliminar imágenes adicionales
        if (currentProduct.additional_images && currentProduct.additional_images.length > 0) {
          for (const imageUrl of currentProduct.additional_images) {
            await deleteImageFromSupabase(imageUrl);
          }
          additional_images = [];
        }
      } catch (error) {
        console.error('Error deleting old images:', error);
      }
    }

    // Manejar nuevas imágenes
    if (image_count > 0 && isSupabaseStorageAvailable()) {
      try {
        const imageUrls: string[] = [];
        
        for (let i = 0; i < image_count; i++) {
          const imageFile = formData.get(`image_${i}`) as File;
          if (imageFile) {
            const uploadedUrl = await uploadImageToSupabase(imageFile, 'products', id);
            imageUrls.push(uploadedUrl);
          }
        }
        
        if (imageUrls.length > 0) {
          image_url = imageUrls[0]; // Primera imagen como principal
          additional_images = imageUrls.slice(1); // Resto como adicionales
        }
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    } else if (image_url_form) {
      // Usar URL proporcionada
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
    if (JSON.stringify(additional_images) !== JSON.stringify(currentProduct.additional_images)) {
      updateData.additional_images = additional_images.length > 0 ? additional_images : null;
    }

    const product = await updateProduct(id, updateData);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Obtener producto para eliminar su imagen
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar imagen de Supabase Storage si existe
    if (product.image_url && isSupabaseStorageAvailable()) {
      try {
        await deleteImageFromSupabase(product.image_url);
        console.log('Imagen eliminada del storage:', product.image_url);
      } catch (error) {
        console.error('Error deleting product image:', error);
      }
    }

    // Eliminar imágenes adicionales si existen
    if (product.additional_images && product.additional_images.length > 0 && isSupabaseStorageAvailable()) {
      try {
        for (const imageUrl of product.additional_images) {
          await deleteImageFromSupabase(imageUrl);
          console.log('Imagen adicional eliminada del storage:', imageUrl);
        }
      } catch (error) {
        console.error('Error deleting additional images:', error);
      }
    }

    // Eliminar producto (esto también eliminará los order_items relacionados)
    await deleteProduct(id);

    console.log('✅ Producto eliminado exitosamente:', id);
    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/[id]:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Proporcionar un mensaje de error más específico
    const errorMessage = error?.message || 'Error al eliminar el producto';
    const statusCode = error?.code === 'PGRST116' ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.details || error?.hint || null
      },
      { status: statusCode }
    );
  }
}
