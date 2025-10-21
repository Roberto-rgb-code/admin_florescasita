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
    // TODO: Descomentar cuando se ejecute el script SQL
    // additional_images: productData.additional_images || [],
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
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Error al eliminar el producto');
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
