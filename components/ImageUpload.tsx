"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const Icon = {
  Upload: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  X: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Image: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  ),
  Link: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Plus: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

type ImageFile = {
  id: string;
  file?: File;
  url: string;
  isUrl: boolean;
};

type Props = {
  onImageChange: (files: File[]) => void;
  onImageUrlChange?: (urls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
};

export default function ImageUpload({ 
  onImageChange, 
  onImageUrlChange, 
  currentImages = [], 
  maxImages = 5 
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<ImageFile[]>(() => 
    currentImages.map(url => ({ id: Math.random().toString(), url, isUrl: true }))
  );
  const [imageUrl, setImageUrl] = useState("");
  const [useUrl, setUseUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`El archivo ${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen ${file.name} debe ser menor a 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: Math.random().toString(),
      file,
      url: URL.createObjectURL(file),
      isUrl: false
    }));

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    setImages(updatedImages);

    // Notificar al padre
    const filesToSend = updatedImages.filter(img => img.file).map(img => img.file!);
    onImageChange(filesToSend);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim() && onImageUrlChange) {
      const newImage: ImageFile = {
        id: Math.random().toString(),
        url: imageUrl,
        isUrl: true
      };
      
      const updatedImages = [...images, newImage].slice(0, maxImages);
      setImages(updatedImages);
      
      const urls = updatedImages.filter(img => img.isUrl).map(img => img.url);
      onImageUrlChange(urls);
      
      setImageUrl("");
    }
  };

  const handleRemove = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);

    // Notificar al padre
    const filesToSend = updatedImages.filter(img => img.file).map(img => img.file!);
    onImageChange(filesToSend);
    
    if (onImageUrlChange) {
      const urls = updatedImages.filter(img => img.isUrl).map(img => img.url);
      onImageUrlChange(urls);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Toggle entre subida y URL */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            !useUrl ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Subir Archivos
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            useUrl ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          URLs de Imágenes
        </button>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image.url}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icon.X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Área de subida */}
      {images.length < maxImages && (
        <>
          {useUrl ? (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Icon.Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Puedes usar URLs de imágenes externas (Unsplash, etc.)
              </p>
            </form>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-300 hover:border-pink-500 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                  {dragActive ? (
                    <Icon.Upload className="w-6 h-6 text-pink-600" />
                  ) : (
                    <Icon.Plus className="w-6 h-6 text-pink-600" />
                  )}
                </div>

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {dragActive ? "Suelta las imágenes aquí" : "Agregar imágenes"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG hasta 5MB cada una
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {images.length}/{maxImages} imágenes
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-gray-500 text-center">
          Máximo {maxImages} imágenes permitidas
        </p>
      )}
    </div>
  );
}
