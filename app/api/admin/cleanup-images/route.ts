import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cleanupOrphanedImages } from '@/lib/supabase-storage';

// POST /api/admin/cleanup-images - Limpiar imágenes huérfanas
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('Iniciando limpieza de imágenes huérfanas...');
    await cleanupOrphanedImages();

    return NextResponse.json({ 
      message: 'Limpieza de imágenes huérfanas completada',
      success: true 
    });
  } catch (error) {
    console.error('Error in POST /api/admin/cleanup-images:', error);
    return NextResponse.json(
      { error: 'Error al limpiar imágenes huérfanas' },
      { status: 500 }
    );
  }
}
