"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "../ImageUpload";
import { Product } from "@/types/product";

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string;
  badge?: string;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: 0,
    category: "",
    is_active: true,
    image_url: "",
    badge: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const categories = [
    { value: "amor", label: "Amor / Aniversario" },
    { value: "cumpleanos", label: "Cumpleaños" },
    { value: "amistad", label: "Amistad" },
    { value: "agradecimiento", label: "Agradecimiento" },
    { value: "graduacion", label: "Graduación" },
    { value: "condolencias", label: "Condolencias" },
    { value: "nacimiento", label: "Nacimiento" },
    { value: "eventos", label: "Eventos" }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || "",
        price: product.price,
        category: product.category || "",
        is_active: product.is_active,
        image_url: product.image_url || "",
        badge: product.badge || "",
      });
      if (product.image_url) {
        setImageUrls([product.image_url]);
      }
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (files: File[]) => {
    setImageFiles(files);
    if (files.length > 0) {
      setImageUrls([]); // Limpiar URLs si se suben archivos
    }
  };

  const handleImageUrlChange = (urls: string[]) => {
    setImageUrls(urls);
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
    setImageFiles([]); // Limpiar archivos si se usan URLs
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Preparar FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("is_active", formData.is_active.toString());
      
      if (formData.badge) {
        formDataToSend.append("badge", formData.badge);
      }

      // Si hay archivos, enviarlos
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, index) => {
          formDataToSend.append(`image_${index}`, file);
        });
        formDataToSend.append("image_count", imageFiles.length.toString());
      } else if (imageUrls.length > 0) {
        // Si hay URLs pero no archivos, enviar las URLs
        formDataToSend.append("image_url", imageUrls[0]);
      }

      const url = isEditing ? `/api/products/${product?.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el producto");
      }

      const data = await response.json();
      console.log("Producto guardado:", data);

      // Redirigir a la lista de productos
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header simple */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? "Modifica la información del producto" 
              : "Agrega un nuevo producto a tu catálogo"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Card principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Producto *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Ej: 50 Rosas Rojas Premium"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                placeholder="Describe el producto..."
              />
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio (MXN) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="0.00"
              />
            </div>

            {/* Categoría y Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-2">
                  Badge (Opcional)
                </label>
                <input
                  type="text"
                  id="badge"
                  name="badge"
                  value={formData.badge || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ej: Más vendido, Premium"
                />
              </div>
            </div>

            {/* Estado activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Producto activo (visible en la tienda)
              </label>
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del Producto
              </label>
              <ImageUpload
                onImageChange={handleImageChange}
                onImageUrlChange={handleImageUrlChange}
                currentImages={imageUrls.length > 0 ? imageUrls : (formData.image_url ? [formData.image_url] : [])}
                maxImages={5}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
