import { supabaseAdmin } from './supabase';

// Subir imagen a Supabase Storage
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'products'
): Promise<string> {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Subir a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('product-image')
      .upload(filePath, fileData, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw new Error('Error al subir la imagen a Supabase Storage');
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('product-image')
      .getPublicUrl(filePath);

    console.log('Generated URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    throw new Error('Error al subir la imagen');
  }
}

// Eliminar imagen de Supabase Storage
export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  try {
    // Solo procesar URLs de Supabase Storage
    if (!imageUrl.includes('supabase') || !imageUrl.includes('product-image')) {
      console.log('URL no es de Supabase Storage, saltando eliminación:', imageUrl);
      return;
    }

    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('product-image') + 1).join('/');

    console.log('Intentando eliminar archivo:', filePath);

    const { error } = await supabaseAdmin.storage
      .from('product-image')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase Storage:', error);
      throw new Error(`Error al eliminar la imagen: ${error.message}`);
    }

    console.log('Archivo eliminado exitosamente:', filePath);
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
    throw new Error('Error al eliminar la imagen');
  }
}

// Verificar si Supabase Storage está configurado
export function isSupabaseStorageAvailable(): boolean {
  return true; // Supabase Storage siempre está disponible si tienes Supabase
}

// Función para limpiar imágenes huérfanas (no usadas por ningún producto)
export async function cleanupOrphanedImages(): Promise<{ deleted: number; errors: string[] }> {
  try {
    // Obtener todas las imágenes del storage
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('product-image')
      .list('products', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return { deleted: 0, errors: [`Error listing files: ${listError.message}`] };
    }

    if (!files || files.length === 0) {
      console.log('No hay archivos en el storage para limpiar');
      return { deleted: 0, errors: [] };
    }

    // Obtener todas las URLs de imágenes usadas en productos
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('image_url, additional_images');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { deleted: 0, errors: [`Error fetching products: ${productsError.message}`] };
    }

    // Recopilar todas las URLs usadas
    const usedUrls = new Set<string>();
    products?.forEach(product => {
      if (product.image_url) {
        usedUrls.add(product.image_url);
      }
      if (product.additional_images && Array.isArray(product.additional_images)) {
        product.additional_images.forEach(url => usedUrls.add(url));
      }
    });

    // Encontrar archivos huérfanos
    const orphanedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-image/products/${file.name}`;
      
      if (!usedUrls.has(fileUrl)) {
        orphanedFiles.push(`products/${file.name}`);
      }
    }

    // Eliminar archivos huérfanos
    let deleted = 0;
    if (orphanedFiles.length > 0) {
      console.log(`Eliminando ${orphanedFiles.length} archivos huérfanos...`);
      
      const { error: deleteError } = await supabaseAdmin.storage
        .from('product-image')
        .remove(orphanedFiles);

      if (deleteError) {
        console.error('Error deleting orphaned files:', deleteError);
        errors.push(`Error deleting files: ${deleteError.message}`);
      } else {
        deleted = orphanedFiles.length;
        console.log(`Eliminados ${deleted} archivos huérfanos exitosamente`);
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Error in cleanupOrphanedImages:', error);
    return { deleted: 0, errors: [`Error in cleanup: ${error}`] };
  }
}
