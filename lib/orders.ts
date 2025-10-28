import { supabaseAdmin } from './supabase';
import { Order, OrderItem, OrderWithItems, OrderCreateInput, OrderUpdateInput, OrderFilters, OrderStats } from '@/types/order';

// Obtener todas las órdenes con items
export async function getOrders(): Promise<OrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image_url,
          category
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Error al obtener las órdenes');
  }

  return data as OrderWithItems[];
}

// Obtener una orden por ID
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image_url,
          category
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data as OrderWithItems;
}

// Crear una nueva orden
export async function createOrder(orderData: OrderCreateInput): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      total_amount: orderData.total_amount,
      status: orderData.status || 'pending',
      shipping_address: orderData.shipping_address,
      delivery_date: orderData.delivery_date,
      delivery_time_slot: orderData.delivery_time_slot,
      stripe_session_id: orderData.stripe_session_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error('Error al crear la orden');
  }

  return data as Order;
}

// Actualizar una orden
export async function updateOrder(
  id: string,
  orderData: OrderUpdateInput
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      ...orderData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw new Error('Error al actualizar la orden');
  }

  return data as Order;
}

// Eliminar una orden
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw new Error('Error al eliminar la orden');
  }
}

// Cambiar estado de una orden
export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Error al cambiar el estado de la orden');
  }

  return data as Order;
}

// Buscar órdenes con filtros
export async function searchOrders(filters: OrderFilters): Promise<OrderWithItems[]> {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image_url,
          category
        )
      )
    `);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  if (filters.customerEmail) {
    query = query.ilike('customer_email', `%${filters.customerEmail}%`);
  }

  if (filters.minAmount) {
    query = query.gte('total_amount', filters.minAmount);
  }

  if (filters.maxAmount) {
    query = query.lte('total_amount', filters.maxAmount);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching orders:', error);
    throw new Error('Error al buscar órdenes');
  }

  return data as OrderWithItems[];
}

// Obtener estadísticas de órdenes
export async function getOrderStats(): Promise<OrderStats> {
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('total_amount, status, created_at');

  if (error) {
    console.error('Error fetching order stats:', error);
    throw new Error('Error al obtener estadísticas');
  }

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats: OrderStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    paidOrders: orders.filter(o => o.status === 'paid').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    averageOrderValue: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
  };

  // Calcular promedio
  if (stats.totalOrders > 0) {
    stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
  }

  // Calcular estadísticas del mes
  const thisMonthOrders = orders.filter(order => 
    new Date(order.created_at) >= thisMonth
  );

  stats.ordersThisMonth = thisMonthOrders.length;
  stats.revenueThisMonth = thisMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);

  return stats;
}

// Obtener órdenes por estado
export async function getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image_url,
          category
        )
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by status:', error);
    throw new Error('Error al obtener órdenes por estado');
  }

  return data as OrderWithItems[];
}

// Obtener órdenes recientes (últimos 10)
export async function getRecentOrders(limit: number = 10): Promise<OrderWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image_url,
          category
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent orders:', error);
    throw new Error('Error al obtener órdenes recientes');
  }

  return data as OrderWithItems[];
}
