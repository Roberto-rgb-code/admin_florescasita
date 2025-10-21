#!/usr/bin/env node

/**
 * Script para limpiar imágenes huérfanas en Supabase Storage
 * Ejecutar con: node cleanup-storage.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lautikiuizleznasrjta.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdXRpa2l1aXpsZXpuYXNyanRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU0MTM4MCwiZXhwIjoyMDc2MTE3MzgwfQ.De5ENBJdjVom1SW4Uhg3k3Dni-9ylyFtSIAqwH3uqWs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOrphanedImages() {
  try {
    console.log('🔍 Buscando imágenes huérfanas en Supabase Storage...');

    // Obtener todas las imágenes del storage
    const { data: files, error: listError } = await supabase.storage
      .from('product-image')
      .list('products', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('✅ No hay archivos en el storage para limpiar');
      return;
    }

    console.log(`📁 Encontrados ${files.length} archivos en el storage`);

    // Obtener todas las URLs de imágenes usadas en productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('image_url, additional_images');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    // Recopilar todas las URLs usadas
    const usedUrls = new Set();
    products?.forEach(product => {
      if (product.image_url) {
        usedUrls.add(product.image_url);
      }
      if (product.additional_images && Array.isArray(product.additional_images)) {
        product.additional_images.forEach(url => usedUrls.add(url));
      }
    });

    console.log(`📊 Encontrados ${products?.length || 0} productos con ${usedUrls.size} imágenes en uso`);

    // Encontrar archivos huérfanos
    const orphanedFiles = [];
    
    for (const file of files) {
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/product-image/products/${file.name}`;
      
      if (!usedUrls.has(fileUrl)) {
        orphanedFiles.push(`products/${file.name}`);
      }
    }

    if (orphanedFiles.length === 0) {
      console.log('✅ No hay archivos huérfanos para eliminar');
      return;
    }

    console.log(`🗑️  Eliminando ${orphanedFiles.length} archivos huérfanos...`);

    // Eliminar archivos huérfanos
    const { error: deleteError } = await supabase.storage
      .from('product-image')
      .remove(orphanedFiles);

    if (deleteError) {
      console.error('❌ Error deleting orphaned files:', deleteError);
      return;
    }

    console.log(`✅ Eliminados ${orphanedFiles.length} archivos huérfanos exitosamente`);
    console.log('📋 Archivos eliminados:');
    orphanedFiles.forEach(file => console.log(`   - ${file}`));

  } catch (error) {
    console.error('❌ Error in cleanup:', error);
  }
}

// Ejecutar limpieza
cleanupOrphanedImages();
