import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProducts, createProduct } from '@/lib/products';
import { uploadImageToS3, isS3Available } from '@/lib/s3';

// GET /api/products - Obtener todos los productos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const products = await getProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(request: Request) {
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
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const badge = formData.get('badge') as string;
    const stock = parseInt(formData.get('stock') as string);
    const is_active = formData.get('is_active') === 'true';
    const image = formData.get('image') as File | null;
    const image_url_form = formData.get('image_url') as string | null;

    // Validaciones
    if (!title || !price || !category) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Manejar imagen: archivo S3 o URL
    let image_url: string | null = null;

    if (image && isS3Available()) {
      try {
        image_url = await uploadImageToS3(image, 'products');
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continuar sin imagen si falla la subida
      }
    } else if (image_url_form) {
      // Usar URL proporcionada (temporal mientras esperamos S3)
      image_url = image_url_form;
    }

    // Crear producto
    const product = await createProduct({
      title,
      description: description || null,
      price,
      category,
      badge: badge || null,
      stock: stock || 0,
      is_active,
      image_url,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}
