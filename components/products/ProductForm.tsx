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
  stock: number;
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
    stock: 0,
    category: "",
    is_active: true,
    image_url: "",
    badge: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const categories = [
    "Amor", "Cumpleaños", "Aniversario", "Condolencias", 
    "Graduación", "Nacimiento", "Amistad", "Agradecimiento", "Eventos"
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category || "",
        is_active: product.is_active,
        image_url: product.image_url || "",
        badge: product.badge || "",
      });
      if (product.image_url) {
        setImageUrl(product.image_url);
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

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImageUrl(""); // Limpiar URL si se sube archivo
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setFormData(prev => ({ ...prev, image_url: url }));
    setImageFile(null); // Limpiar archivo si se usa URL
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
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("is_active", formData.is_active.toString());
      
      if (formData.badge) {
        formDataToSend.append("badge", formData.badge);
      }

      // Si hay archivo, enviarlo
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (imageUrl) {
        // Si hay URL pero no archivo, enviar la URL
        formDataToSend.append("image_url", imageUrl);
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
    <div className="max-w-4xl mx-auto">
      {/* Header con breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Admin</span>
          <span>›</span>
          <span>Productos</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">🌸</span>
          {isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing 
            ? "Modifica la información del producto" 
            : "Completa la información para agregar un nuevo producto al catálogo"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al guardar</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Información Básica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📝</span>
              Información Básica
            </h2>
            <p className="text-sm text-gray-600 mt-1">Datos principales del producto</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                Título del Producto *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
                placeholder="Ej: 50 Rosas Rojas Premium"
              />
              <p className="text-xs text-gray-500">Un título descriptivo y atractivo para el producto</p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 resize-none"
                placeholder="Describe las características, beneficios y detalles del producto..."
              />
              <p className="text-xs text-gray-500">Una descripción detallada ayuda a los clientes a entender mejor el producto</p>
            </div>
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">💰</span>
              Precio e Inventario
            </h2>
            <p className="text-sm text-gray-600 mt-1">Configura el precio y disponibilidad</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                  Precio (MXN) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">Precio en pesos mexicanos</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-900">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">Cantidad disponible en inventario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categorización */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🏷️</span>
              Categorización
            </h2>
            <p className="text-sm text-gray-600 mt-1">Organiza y etiqueta tu producto</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Ayuda a los clientes a encontrar el producto</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="badge" className="block text-sm font-medium text-gray-900">
                  Badge (Opcional)
                </label>
                <input
                  type="text"
                  id="badge"
                  name="badge"
                  value={formData.badge || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-lg"
                  placeholder="Ej: Más vendido, Premium, Nuevo"
                />
                <p className="text-xs text-gray-500">Etiqueta especial para destacar el producto</p>
              </div>
            </div>

            {/* Estado activo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-900">
                  Producto activo (visible en la tienda)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Los productos inactivos no aparecerán en el catálogo público
              </p>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🖼️</span>
              Imagen del Producto
            </h2>
            <p className="text-sm text-gray-600 mt-1">Una imagen atractiva aumenta las ventas</p>
          </div>
          
          <div className="p-6">
            <ImageUpload
              onImageChange={handleImageChange}
              onImageUrlChange={handleImageUrlChange}
              currentImage={imageUrl || formData.image_url}
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-2">{isEditing ? "💾" : "➕"}</span>
                  {isEditing ? "Actualizar Producto" : "Crear Producto"}
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
