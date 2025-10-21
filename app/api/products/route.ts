import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProducts, createProduct } from '@/lib/products';
import { uploadImageToSupabase, isSupabaseStorageAvailable } from '@/lib/supabase-storage';

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
    const image_count = parseInt(formData.get('image_count') as string) || 0;
    const image_url_form = formData.get('image_url') as string | null;

    // Validaciones
    if (!title || !price || !category) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Manejar imágenes: archivos Supabase Storage o URL
    let image_url: string | null = null;

    if (image_count > 0 && isSupabaseStorageAvailable()) {
      try {
        // Subir la primera imagen como imagen principal
        const firstImage = formData.get('image_0') as File;
        if (firstImage) {
          image_url = await uploadImageToSupabase(firstImage, 'products');
        }
      } catch (error) {
        console.error('Error uploading image to Supabase Storage:', error);
        // Continuar sin imagen si falla la subida
      }
    } else if (image_url_form) {
      // Usar URL proporcionada
      image_url = image_url_form;
    } else if (image_count > 0) {
      // Si hay archivos pero no se puede subir, usar imagen por defecto
      console.log('No se pudo subir la imagen, usando imagen por defecto');
      image_url = "/flores_hero1.jpeg";
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
