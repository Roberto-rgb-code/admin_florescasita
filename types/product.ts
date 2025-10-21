export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  additional_images?: string[] | null;
  category: string | null;
  badge: string | null;
  rating: number;
  reviews: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  badge?: string;
  stock: number;
  is_active: boolean;
}

export type ProductCreateInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;
