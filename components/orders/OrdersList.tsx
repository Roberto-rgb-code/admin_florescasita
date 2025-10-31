"use client";

import { useState, useEffect } from "react";
import { OrderWithItems, OrderStats, OrderStatus } from "@/types/order";

export default function OrdersList() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      
      if (!response.ok) {
        throw new Error("Error al cargar las órdenes");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/orders?stats=true");
      
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Actualizar la lista local
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      // Refrescar estadísticas
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6 lg:space-y-8">
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

  return (
    <div className="w-full h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Ventas</h1>
            <p className="text-gray-600 mt-1 text-lg">Gestiona las órdenes y ventas de tu tienda</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl lg:text-3xl">🛒</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Órdenes</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
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
                      <p className="text-2xl lg:text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl lg:text-3xl">⏳</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pendientes</p>
                      <p className="text-2xl lg:text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
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
                      <p className="text-2xl lg:text-3xl font-bold text-purple-600">${stats.averageOrderValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por cliente, email o ID de orden..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input pl-12 w-full h-12 lg:h-14 text-sm lg:text-base"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg lg:text-xl">🔍</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "all")}
                    className="btn btn-secondary text-sm lg:text-base px-4 py-2 h-12 lg:h-14"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 lg:py-20">
              <div className="max-w-md mx-auto">
                <div className="text-8xl lg:text-9xl mb-6">🛒</div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {searchQuery || selectedStatus !== "all" ? "No se encontraron órdenes" : "¡Aún no hay órdenes!"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg lg:text-xl">
                  {searchQuery || selectedStatus !== "all"
                    ? "Intenta con otros filtros de búsqueda"
                    : "Las órdenes aparecerán aquí cuando los clientes realicen compras"
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                              Orden #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Cliente</p>
                            <p className="text-gray-600">{order.customer_name}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p className="text-gray-600">{order.customer_email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Total</p>
                            <p className="text-lg font-bold text-gray-900">${order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Información de envío */}
                        {order.shipping_address && typeof order.shipping_address === 'object' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="font-medium text-gray-700 mb-2">Información de entrega:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              {(order.shipping_address as any)?.address && (
                                <div>
                                  <p className="font-medium text-gray-700">Dirección</p>
                                  <p className="text-gray-600 truncate">{(order.shipping_address as any).address}</p>
                                </div>
                              )}
                              {(order.shipping_address as any)?.distance !== undefined && (order.shipping_address as any).distance !== null && (
                                <div>
                                  <p className="font-medium text-gray-700">Distancia</p>
                                  <p className="text-gray-600">{(order.shipping_address as any).distance} km</p>
                                </div>
                              )}
                              {(order.shipping_address as any)?.shippingCost !== undefined && (
                                <div>
                                  <p className="font-medium text-gray-700">Costo envío</p>
                                  <p className="text-gray-600">${((order.shipping_address as any).shippingCost || 0).toLocaleString()}</p>
                                </div>
                              )}
                              {order.delivery_date && (
                                <div>
                                  <p className="font-medium text-gray-700">Fecha entrega</p>
                                  <p className="text-gray-600">{new Date(order.delivery_date).toLocaleDateString('es-MX')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="mt-4">
                          <p className="font-medium text-gray-700 mb-2">Productos:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                {item.product?.image_url && (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.title}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <span className="text-sm font-medium">{item.product?.title || 'Producto eliminado'}</span>
                                <span className="text-sm text-gray-500">x{item.quantity}</span>
                                <span className="text-sm font-bold">${item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:min-w-48">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pagado</option>
                          <option value="processing">Procesando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                          <option value="refunded">Reembolsado</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            // TODO: Implementar vista de detalles
                            alert('Vista de detalles próximamente');
                          }}
                          className="w-full btn btn-secondary text-sm py-2"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
