"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  category: string;
  image_url?: string;
  additional_images?: string[];
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalRevenue = products.reduce((acc, p) => acc + p.price, 0);
  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Panel de administración de La Casita de las Flores</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Productos Activos</p>
                    <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categorías</p>
                    <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Catálogo</p>
                    <p className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <Link href="/admin/products/new" className="w-full btn btn-primary flex items-center justify-center">
                    <span className="mr-2">➕</span>
                    Agregar Nuevo Producto
                  </Link>
                  
                  <Link href="/admin/products" className="w-full btn btn-secondary flex items-center justify-center">
                    <span className="mr-2">📦</span>
                    Ver Todos los Productos
                  </Link>
                  
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Productos Recientes</h2>
              </div>
              <div className="card-body">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-600 mb-4">No hay productos aún</p>
                    <Link href="/admin/products/new" className="btn btn-primary">
                      Agregar Primer Producto
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-lg">📦</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                          <p className="text-sm text-gray-500">${product.price} • {product.category}</p>
                        </div>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="btn btn-sm btn-secondary"
                        >
                          ✏️
                        </Link>
                      </div>
                    ))}
                    {products.length > 5 && (
                      <div className="text-center">
                        <Link href="/admin/products" className="text-sm text-pink-600 hover:text-pink-700">
                          Ver todos los productos ({products.length - 5} más)
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
              </div>
              <div className="card-body">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏷️</div>
                    <p className="text-gray-600">No hay categorías aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const categoryProducts = products.filter(p => p.category === category);
                      return (
                        <div key={category} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 capitalize">{category}</p>
                              <p className="text-xs text-gray-500">{categoryProducts.length} productos</p>
                            </div>
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">🌸</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}