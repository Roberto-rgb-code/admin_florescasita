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
};

type Props = {
  onImageChange: (file: File | null) => void;
  onImageUrlChange?: (url: string) => void;
  currentImage?: string | null;
};

export default function ImageUpload({ onImageChange, onImageUrlChange, currentImage }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notificar al padre
    onImageChange(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim() && onImageUrlChange) {
      setPreview(imageUrl);
      onImageUrlChange(imageUrl);
      setImageUrl("");
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
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
            !useUrl ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Subir Archivo
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            useUrl ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          URL de Imagen
        </button>
      </div>

      {preview ? (
        <div className="relative">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <Icon.X className="w-4 h-4" />
          </button>
        </div>
      ) : useUrl ? (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon.Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Cargar
            </button>
          </div>
          <p className="text-xs text-gray-500">
            ⚠️ Mientras esperamos AWS S3, puedes usar URLs de imágenes externas (Unsplash, etc.)
          </p>
        </form>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-500 hover:bg-gray-50"
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
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              {dragActive ? (
                <Icon.Upload className="w-8 h-8 text-primary-600" />
              ) : (
                <Icon.Image className="w-8 h-8 text-primary-600" />
              )}
            </div>

            <p className="text-sm font-medium text-gray-900 mb-1">
              {dragActive ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG hasta 5MB (requiere AWS S3 configurado)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
