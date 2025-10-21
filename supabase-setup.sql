-- ==========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- La Casita de las Flores - Admin Panel
-- ==========================================

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  additional_images TEXT[], -- Array de URLs de imágenes adicionales
  category TEXT,
  badge TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de items de orden
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de productos activos
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products" 
    ON products FOR SELECT 
    USING (is_active = true);

-- Permitir todo para usuarios autenticados (admin)
DROP POLICY IF EXISTS "Authenticated users can do everything on products" ON products;
CREATE POLICY "Authenticated users can do everything on products" 
    ON products FOR ALL 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can do everything on orders" ON orders;
CREATE POLICY "Authenticated users can do everything on orders" 
    ON orders FOR ALL 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can do everything on order_items" ON order_items;
CREATE POLICY "Authenticated users can do everything on order_items" 
    ON order_items FOR ALL 
    USING (auth.role() = 'authenticated');

-- Insertar productos de ejemplo (opcional)
INSERT INTO products (title, description, price, category, badge, stock, is_active, image_url) VALUES
('Lenu', 'Hermoso arreglo floral con flores frescas de temporada', 990.00, 'amor', 'Favorito', 15, true, null),
('Green Garden Large', 'Arreglo grande con flores verdes y blancas', 1590.00, 'cumpleaños', null, 10, true, null),
('Ramo de flores rosas Madisson', 'Elegante ramo de rosas rosadas frescas', 929.00, 'amor', null, 20, true, null),
('Amazing Para cualquier ocasión', 'Arreglo versátil perfecto para cualquier momento', 1329.00, 'eventos', null, 12, true, null)
ON CONFLICT DO NOTHING;

-- Comentarios de las tablas
COMMENT ON TABLE products IS 'Catálogo de productos/arreglos florales';
COMMENT ON TABLE orders IS 'Órdenes de compra de clientes';
COMMENT ON TABLE order_items IS 'Items/productos individuales de cada orden';

-- ==========================================
-- INSTRUCCIONES DE USO:
-- 1. Abre el SQL Editor en Supabase Dashboard
-- 2. Copia y pega este script completo
-- 3. Ejecuta el script (botón RUN)
-- 4. Verifica que las tablas se crearon en Table Editor
-- ==========================================
