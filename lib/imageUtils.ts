/**
 * Utilidades para manejar imágenes de Supabase Storage
 */

// Función para procesar URLs de Supabase Storage
export function processSupabaseImageUrl(url: string): string {
  if (!url) return '/flores_hero1.jpeg';
  
  // Si es una URL de Supabase Storage
  if (url.includes('supabase.co') || url.includes('supabase.in')) {
    // Verificar si la URL ya tiene parámetros de transformación
    if (url.includes('?')) {
      return url;
    }
    
    // Para URLs de Supabase Storage, podemos agregar parámetros de optimización
    // pero por ahora devolvemos la URL tal como está
    return url;
  }
  
  return url;
}

// Función para verificar si una URL es válida
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Función para obtener la URL de fallback
export function getFallbackImageUrl(): string {
  return '/flores_hero1.jpeg';
}

// Función para procesar múltiples URLs de imágenes
export function processImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .filter(Boolean)
    .map(url => processSupabaseImageUrl(url as string))
    .filter(url => url !== getFallbackImageUrl() || urls.length === 0);
}

// Función para crear objeto de imagen para react-image-gallery
export function createGalleryImageItem(
  url: string, 
  productName: string, 
  index: number
) {
  return {
    original: processSupabaseImageUrl(url),
    thumbnail: processSupabaseImageUrl(url),
    originalAlt: `${productName} - Imagen ${index + 1}`,
    thumbnailAlt: `${productName} - Miniatura ${index + 1}`,
  };
}

// Función para crear array de imágenes para la galería
export function createGalleryImages(
  images: string[], 
  productName: string = 'Producto'
) {
  return images.map((image, index) => 
    createGalleryImageItem(image, productName, index)
  );
}
