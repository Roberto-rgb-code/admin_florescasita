import { supabaseAdmin } from './supabase';
import { Product, ProductCreateInput, ProductUpdateInput } from '@/types/product';

// Obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Error al obtener los productos');
  }

  return data as Product[];
}

// Obtener un producto por ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data as Product;
}

// Crear un nuevo producto
export async function createProduct(productData: ProductCreateInput): Promise<Product> {
  const insertData = {
    title: productData.title,
    description: productData.description,
    price: productData.price,
    image_url: productData.image_url,
    additional_images: productData.additional_images || null,
    category: productData.category,
    badge: productData.badge,
    stock: productData.stock,
    is_active: productData.is_active,
    rating: 0,
    reviews: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error('Error al crear el producto');
  }

  return data as Product;
}

// Actualizar un producto
export async function updateProduct(
  id: string,
  productData: ProductUpdateInput
): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      ...productData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Error al actualizar el producto');
  }

  return data as Product;
}

// Eliminar un producto
export async function deleteProduct(id: string): Promise<void> {
  // Primero, eliminar todos los order_items relacionados
  // Esto es necesario si la foreign key no tiene ON DELETE CASCADE
  try {
    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('product_id', id);
    
    if (orderItemsError) {
      console.error('Error deleting order_items:', orderItemsError);
      // No lanzamos error aquí, podría no haber order_items
      // Solo lo logueamos
    } else {
      console.log('Order items relacionados eliminados exitosamente');
    }
  } catch (err) {
    console.warn('Warning: No se pudieron eliminar order_items (puede ser que no existan):', err);
  }

  // Ahora eliminar el producto
  const { error, data } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting product:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    
    // Si es un error de foreign key constraint
    if (error.code === '23503') {
      throw new Error('No se puede eliminar el producto porque tiene órdenes asociadas. Primero elimina las órdenes relacionadas.');
    }
    
    throw new Error(`Error al eliminar el producto: ${error.message}`);
  }

  // Verificar que se eliminó correctamente
  if (!data || data.length === 0) {
    throw new Error('El producto no fue encontrado o ya fue eliminado');
  }
}

// Activar/Desactivar un producto
export async function toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling product status:', error);
    throw new Error('Error al cambiar el estado del producto');
  }

  return data as Product;
}

// Buscar productos
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    throw new Error('Error al buscar productos');
  }

  return data as Product[];
}

// Obtener productos por categoría
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Error al obtener productos por categoría');
  }

  return data as Product[];
}
