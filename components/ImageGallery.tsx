'use client';

import { useState, useEffect } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import UnoptimizedImage from './UnoptimizedImage';
import { createGalleryImages } from '@/lib/imageUtils';

interface ImageGalleryProps {
  images: string[];
  productName?: string;
  className?: string;
}

export default function ImageGalleryComponent({ images, productName = 'Producto', className = '' }: ImageGalleryProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center p-4">
          <span className="text-4xl">📦</span>
          <p className="text-xs mt-1">Sin imagen</p>
        </div>
      </div>
    );
  }

  // Convertir las imágenes al formato que espera react-image-gallery
  const galleryImages = createGalleryImages(images, productName);

  if (!isClient) {
    // Renderizar una imagen simple durante la hidratación
    return (
      <div className={className}>
        <div className="relative w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Cargando galería...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ImageGallery
        items={galleryImages}
        showThumbnails={images.length > 1}
        showFullscreenButton={true}
        showPlayButton={false}
        showBullets={images.length > 1}
        showNav={images.length > 1}
        autoPlay={false}
        slideInterval={3000}
        slideDuration={450}
        useBrowserFullscreen={true}
        showIndex={false}
        lazyLoad={true}
        onErrorImageURL="/flores_hero1.jpeg"
        renderItem={(item) => (
          <div className="image-gallery-image">
            <UnoptimizedImage
              src={item.original || '/flores_hero1.jpeg'}
              alt={item.originalAlt || `${productName} - Imagen`}
              fill
              className="w-full h-full"
            />
          </div>
        )}
        renderThumbInner={(item) => (
          <div className="image-gallery-thumbnail-inner">
            <UnoptimizedImage
              src={item.thumbnail || '/flores_hero1.jpeg'}
              alt={item.thumbnailAlt || `${productName} - Miniatura`}
              width={80}
              height={80}
              className="w-full h-full"
            />
          </div>
        )}
      />
    </div>
  );
}
