import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrderById, updateOrder, deleteOrder, updateOrderStatus } from '@/lib/orders';

// GET /api/orders/[id] - Obtener una orden específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Actualizar una orden
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Si solo se está actualizando el estado
    if (body.status && Object.keys(body).length === 1) {
      const order = await updateOrderStatus(id, body.status);
      return NextResponse.json({ order });
    }

    // Actualización completa
    const order = await updateOrder(id, body);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la orden' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Eliminar una orden
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteOrder(id);

    return NextResponse.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la orden' },
      { status: 500 }
    );
  }
}
