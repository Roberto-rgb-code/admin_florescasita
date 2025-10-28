import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrders, getOrderStats, getRecentOrders } from '@/lib/orders';

// GET /api/orders - Obtener todas las órdenes
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';
    const recent = searchParams.get('recent') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (stats) {
      const orderStats = await getOrderStats();
      return NextResponse.json({ stats: orderStats });
    }

    if (recent) {
      const recentOrders = await getRecentOrders(limit);
      return NextResponse.json({ orders: recentOrders });
    }

    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener las órdenes' },
      { status: 500 }
    );
  }
}
