'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productName?: string;
  className?: string;
}

export default function ImageGallery({ images, productName = 'Producto', className = '' }: ImageGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightGalleryRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !galleryRef.current || images.length === 0) return;

    // Import lightGallery dynamically only on client side
    const initGallery = async () => {
      try {
        const lightGallery = (await import('lightgallery')).default;
        const lgThumbnail = (await import('lg-thumbnail')).default;
        const lgZoom = (await import('lg-zoom')).default;
        const lgAutoplay = (await import('lg-autoplay')).default;
        const lgFullscreen = (await import('lg-fullscreen')).default;

        // Import CSS
        await import('lightgallery/css/lightgallery.css');
        await import('lightgallery/css/lg-zoom.css');
        await import('lightgallery/css/lg-thumbnail.css');
        await import('lightgallery/css/lg-autoplay.css');
        await import('lightgallery/css/lg-fullscreen.css');

        // Destroy existing gallery if it exists
        if (lightGalleryRef.current) {
          lightGalleryRef.current.destroy();
        }

        // Create new gallery
        if (galleryRef.current) {
          lightGalleryRef.current = lightGallery(galleryRef.current, {
            plugins: [lgThumbnail, lgZoom, lgAutoplay, lgFullscreen],
            speed: 500,
            download: false,
            enableSwipe: true,
            enableDrag: true,
            thumbnail: true,
            autoplay: false,
            fullScreen: true,
            zoom: true,
            selector: '.gallery-item',
            dynamic: true,
            dynamicEl: images.map((image, index) => ({
              src: image,
              thumb: image,
              subHtml: `<h4>${productName} - Imagen ${index + 1}</h4>`,
            })),
          });
        }
      } catch (error) {
        console.error('Error loading lightGallery:', error);
      }
    };

    initGallery();

    return () => {
      if (lightGalleryRef.current) {
        lightGalleryRef.current.destroy();
      }
    };
  }, [isClient, images, productName]);

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

  return (
    <div ref={galleryRef} className={className}>
      {/* Main image display */}
      <div className="relative group cursor-pointer">
        <img
          src={images[0]}
          alt={`${productName} - Imagen principal`}
          className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/flores_hero1.jpeg'; // Fallback image
          }}
        />
        
        {/* Overlay with gallery icon */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Multiple images indicator */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
            +{images.length - 1}
          </div>
        )}
      </div>

      {/* Thumbnail images (hidden, used by lightGallery) */}
      <div className="hidden">
        {images.map((image, index) => (
          <div key={index} className="gallery-item">
            <img src={image} alt={`${productName} - Imagen ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
