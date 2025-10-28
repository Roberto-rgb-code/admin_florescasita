export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  delivery_date?: string;
  delivery_time_slot?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    title: string;
    image_url: string | null;
    category: string | null;
  };
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  // Campos adicionales del checkout
  senderName?: string;
  recipientName?: string;
  dedicationMessage?: string;
  isAnonymous?: boolean;
  recipientPhone?: string;
  deliveryAddress?: string;
  addressType?: string;
  companyArea?: string;
  deliveryRoute?: string;
  distance?: number;
  shippingCost?: number;
}

export type OrderStatus = 
  | 'pending'      // Pendiente de pago
  | 'paid'         // Pagado
  | 'processing'   // En proceso
  | 'shipped'      // Enviado
  | 'delivered'    // Entregado
  | 'cancelled'    // Cancelado
  | 'refunded';    // Reembolsado

export interface OrderCreateInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status?: OrderStatus;
  shipping_address: ShippingAddress;
  delivery_date?: string;
  delivery_time_slot?: string;
  stripe_session_id?: string;
}

export interface OrderUpdateInput {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount?: number;
  status?: OrderStatus;
  shipping_address?: ShippingAddress;
  delivery_date?: string;
  delivery_time_slot?: string;
  stripe_session_id?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  customerEmail?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderStats {
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
