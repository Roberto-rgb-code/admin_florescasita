-- ============================================
-- MIGRACIÓN: Agregar campo additional_images
-- La Casita de las Flores
-- ============================================

-- Agregar la columna additional_images como array de texto
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[];

-- Comentario para la columna
COMMENT ON COLUMN products.additional_images IS 'Array de URLs de imágenes adicionales del producto';

-- Actualizar productos existentes para que tengan array vacío en lugar de NULL
UPDATE products 
SET additional_images = ARRAY[]::TEXT[] 
WHERE additional_images IS NULL;

-- Verificar que la migración se aplicó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'additional_images';

-- Mostrar el estado actual de la tabla
SELECT 
  COUNT(*) as total_products,
  COUNT(image_url) as products_with_main_image,
  COUNT(additional_images) as products_with_additional_images
FROM products;
