-- Migración para agregar campo additional_images a la tabla products
-- Ejecutar este script en el SQL Editor de Supabase

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
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'additional_images';
