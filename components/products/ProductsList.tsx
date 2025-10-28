"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageModal from "../ImageModal";
import ImageGalleryComponent from "../ImageGallery";
import ConfirmationModal from "../ui/ConfirmationModal";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  is_active: boolean;
  image_url?: string;
  additional_images?: string[];
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
  }>({ isOpen: false, images: [], initialIndex: 0 });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productTitle: string;
    isLoading: boolean;
  }>({ isOpen: false, productId: null, productTitle: "", isLoading: false });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      
      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productTitle: title,
      isLoading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/products/${deleteModal.productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      setProducts(products.filter(p => p.id !== deleteModal.productId));
      setDeleteModal({ isOpen: false, productId: null, productTitle: "", isLoading: false });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productTitle: "", isLoading: false });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openImageModal = (product: Product) => {
    const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean) as string[];
    if (allImages.length > 0) {
      setImageModal({
        isOpen: true,
        images: allImages,
        initialIndex: 0
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="card-body">
                      <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="card max-w-md mx-auto">
              <div className="card-body text-center">
                <div className="text-6xl mb-4">🌸</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Comienza agregando productos!</h3>
                <p className="text-gray-600 mb-4">No hay productos en tu catálogo aún. Agrega tu primer producto para comenzar.</p>
                <Link href="/admin/products/new" className="btn btn-primary">
                  ➕ Agregar Primer Producto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600 mt-1 text-lg">Gestiona tu inventario de flores</p>
            </div>
            <Link href="/admin/products/new" className="btn btn-primary w-full sm:w-auto py-3 px-6 text-base">
              <span className="mr-2">➕</span>
              Nuevo Producto
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="card">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar productos por nombre o categoría..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input pl-12 w-full h-12 lg:h-14 text-sm lg:text-base"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg lg:text-xl">🔍</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-secondary text-sm lg:text-base px-4 py-2 h-12 lg:h-14">
                    <span className="mr-2">🏷️</span>
                    Filtros
                  </button>
                  <button className="btn btn-secondary text-sm lg:text-base px-4 py-2 h-12 lg:h-14">
                    <span className="mr-2">📊</span>
                    Ordenar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 lg:py-20">
              <div className="max-w-md mx-auto">
                <div className="text-8xl lg:text-9xl mb-6">🌸</div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {searchQuery ? "No se encontraron productos" : "¡Comienza a agregar tus flores!"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg lg:text-xl">
                  {searchQuery 
                    ? "Intenta con otros términos de búsqueda"
                    : "Agrega tu primer producto al catálogo y comienza a vender"
                  }
                </p>
                <Link href="/admin/products/new" className="btn btn-primary btn-lg py-4 px-8 text-lg">
                  <span className="mr-2">➕</span>
                  Agregar Primer Producto
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="card-body p-4 lg:p-6">
                    {/* Imagen del producto */}
                    <div className="mb-4 relative overflow-hidden rounded-lg">
                      {product.image_url ? (
                        <div className="w-full h-40 sm:h-48 lg:h-56">
                          <ImageGalleryComponent 
                            images={[product.image_url, ...(product.additional_images || [])].filter(Boolean)}
                            productName={product.title}
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-4xl lg:text-5xl">📦</span>
                            <p className="text-xs lg:text-sm text-gray-500 mt-1">Sin imagen</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge de estado */}
                      <div className="absolute top-2 right-2">
                        <span className={`badge text-xs lg:text-sm ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {/* Indicador de múltiples imágenes */}
                      {(product.additional_images && product.additional_images.length > 0) && (
                        <div className="absolute bottom-2 right-2">
                          <div className="bg-black bg-opacity-70 text-white text-xs lg:text-sm px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {1 + (product.additional_images?.length || 0)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-500 mt-1">{product.category}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl lg:text-2xl font-bold text-gray-900">${product.price}</span>
                      </div>

                      {product.description && (
                        <p className="text-sm lg:text-base text-gray-500 line-clamp-2">{product.description}</p>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2 w-full">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="btn btn-sm lg:btn btn-secondary flex-1 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <span className="mr-1">✏️</span>
                          <span className="hidden sm:inline">Editar</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id, product.title)}
                          className="btn btn-sm lg:btn btn-danger flex-1 py-2 lg:py-3 text-sm lg:text-base"
                        >
                          <span className="mr-1">🗑️</span>
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body text-center p-4 sm:p-6">
                <div className="flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-pink-100 rounded-xl mx-auto mb-4">
                  <span className="text-2xl lg:text-3xl">📦</span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{products.length}</p>
                <p className="text-sm lg:text-base text-gray-600 font-medium">Total Productos</p>
              </div>
            </div>
            
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body text-center p-4 sm:p-6">
                <div className="flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-green-100 rounded-xl mx-auto mb-4">
                  <span className="text-2xl lg:text-3xl">✅</span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-green-600 mb-1">{products.filter(p => p.is_active).length}</p>
                <p className="text-sm lg:text-base text-gray-600 font-medium">Activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        images={imageModal.images}
        initialIndex={imageModal.initialIndex}
        onClose={() => setImageModal({ isOpen: false, images: [], initialIndex: 0 })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de que quieres eliminar "${deleteModal.productTitle}"? Esta acción no se puede deshacer y también se eliminarán todas las imágenes asociadas.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}