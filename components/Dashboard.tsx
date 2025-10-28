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

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [isCleaningImages, setIsCleaningImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products
      const productsResponse = await fetch("/api/products");
      if (!productsResponse.ok) {
        throw new Error("Error al cargar los productos");
      }
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      // Fetch order stats
      const statsResponse = await fetch("/api/orders?stats=true");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setOrderStats(statsData.stats);
      }

      // Fetch recent orders
      const ordersResponse = await fetch("/api/orders?recent=true&limit=5");
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupImages = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar las imágenes huérfanas? Esta acción eliminará todas las imágenes que no estén asociadas a productos.')) {
      return;
    }

    setIsCleaningImages(true);
    try {
      const response = await fetch('/api/admin/cleanup-images', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al limpiar imágenes');
      }

      const result = await response.json();
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsCleaningImages(false);
    }
  };

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
    <div className="w-full h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-lg">Panel de administración de La Casita de las Flores</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl lg:text-3xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Productos</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl lg:text-3xl">🛒</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Órdenes</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">{orderStats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl lg:text-3xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">${orderStats?.totalRevenue.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl lg:text-3xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ticket Promedio</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-600">${orderStats?.averageOrderValue.toFixed(0) || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Quick Actions */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <Link href="/admin/products/new" className="w-full btn btn-primary flex items-center justify-center py-3 text-base">
                    <span className="mr-2">➕</span>
                    Agregar Nuevo Producto
                  </Link>
                  
                  <Link href="/admin/products" className="w-full btn btn-secondary flex items-center justify-center py-3 text-base">
                    <span className="mr-2">📦</span>
                    Ver Todos los Productos
                  </Link>
                  
                  <button
                    onClick={handleCleanupImages}
                    disabled={isCleaningImages}
                    className="w-full btn btn-warning flex items-center justify-center py-3 text-base disabled:opacity-50"
                  >
                    <span className="mr-2">{isCleaningImages ? '⏳' : '🧹'}</span>
                    {isCleaningImages ? 'Limpiando...' : 'Limpiar Imágenes Huérfanas'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Órdenes Recientes</h2>
              </div>
              <div className="card-body">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🛒</div>
                    <p className="text-gray-600 mb-4">No hay órdenes aún</p>
                    <p className="text-sm text-gray-500">Las órdenes aparecerán aquí cuando los clientes realicen compras</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🛒</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                            {order.customer_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${order.total_amount.toLocaleString()} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`badge text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {order.status === 'pending' ? 'Pendiente' : 
                           order.status === 'paid' ? 'Pagado' : order.status}
                        </span>
                      </div>
                    ))}
                    <div className="text-center">
                      <Link href="/admin/orders" className="text-sm text-pink-600 hover:text-pink-700">
                        Ver todas las órdenes
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Categorías</h2>
              </div>
              <div className="card-body">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏷️</div>
                    <p className="text-gray-600">No hay categorías aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {categories.map((category) => {
                      const categoryProducts = products.filter(p => p.category === category);
                      return (
                        <div key={category} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm lg:text-base font-medium text-gray-900 capitalize">{category}</p>
                              <p className="text-xs lg:text-sm text-gray-500">{categoryProducts.length} productos</p>
                            </div>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-sm lg:text-base">🌸</span>
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