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

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    throw new Error('Error al subir la imagen');
  }
}

// Eliminar imagen de Supabase Storage
export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('product-image') + 1).join('/');

    const { error } = await supabaseAdmin.storage
      .from('product-image')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase Storage:', error);
      throw new Error('Error al eliminar la imagen');
    }
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
    throw new Error('Error al eliminar la imagen');
  }
}

// Verificar si Supabase Storage está configurado
export function isSupabaseStorageAvailable(): boolean {
  return true; // Supabase Storage siempre está disponible si tienes Supabase
}
