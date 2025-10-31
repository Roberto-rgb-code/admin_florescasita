import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  searchProducts,
  getProductsByCategory,
} from '../products';
import { ProductCreateInput, ProductUpdateInput } from '@/types/product';

// Mock del módulo supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockOr = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

import { supabaseAdmin } from '../supabase';

describe('Products API - Admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to chainable structure
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });
    
    // Setup mock from to return the chainable structure
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      expect(table).toBe('products');
      return mockFrom();
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      or: mockOr,
      order: mockOrder,
      single: mockSingle,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    });
    mockOr.mockReturnValue({
      order: mockOrder,
    });
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
  });

  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Rosa Roja',
          price: 25.99,
          image_url: 'https://example.com/rosa.jpg',
          category: 'Rosas',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const products = await getProducts();

      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: '1',
        title: 'Rosa Roja',
        price: 25.99,
      });
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });

    it('should throw error when fetch fails', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(getProducts()).rejects.toThrow('Error al obtener los productos');
    });
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      const mockProduct = {
        id: '1',
        title: 'Rosa Roja',
        price: 25.99,
        image_url: 'https://example.com/rosa.jpg',
      };

      mockSingle.mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const product = await getProductById('1');

      expect(product).toBeTruthy();
      expect(product?.id).toBe('1');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });

    it('should return null when product is not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const product = await getProductById('999');

      expect(product).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const productData: ProductCreateInput = {
        title: 'Nueva Rosa',
        description: 'Descripción',
        price: 30.99,
        image_url: 'https://example.com/nueva.jpg',
        category: 'Rosas',
        stock: 100,
        is_active: true,
      };

      mockSingle.mockResolvedValue({
        data: { id: '2', ...productData },
        error: null,
      });

      const product = await createProduct(productData);

      expect(product).toBeTruthy();
      expect(product.title).toBe('Nueva Rosa');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });

    it('should throw error when creation fails', async () => {
      const productData: ProductCreateInput = {
        title: 'Nueva Rosa',
        price: 30.99,
        image_url: 'https://example.com/nueva.jpg',
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(createProduct(productData)).rejects.toThrow('Error al crear el producto');
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const updateData: ProductUpdateInput = {
        title: 'Rosa Actualizada',
        price: 35.99,
      };

      mockSingle.mockResolvedValue({
        data: { id: '1', ...updateData },
        error: null,
      });

      const product = await updateProduct('1', updateData);

      expect(product).toBeTruthy();
      expect(product.title).toBe('Rosa Actualizada');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });

    it('should throw error when update fails', async () => {
      const updateData: ProductUpdateInput = {
        title: 'Rosa Actualizada',
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(updateProduct('1', updateData)).rejects.toThrow('Error al actualizar el producto');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockEq.mockResolvedValue({
        error: null,
      });

      await expect(deleteProduct('1')).resolves.not.toThrow();
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });

    it('should throw error when deletion fails', async () => {
      mockEq.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      await expect(deleteProduct('1')).rejects.toThrow('Error al eliminar el producto');
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product status successfully', async () => {
      mockSingle.mockResolvedValue({
        data: { id: '1', is_active: false },
        error: null,
      });

      const product = await toggleProductStatus('1', false);

      expect(product.is_active).toBe(false);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });
  });

  describe('searchProducts', () => {
    it('should return products matching search query', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Rosa Roja',
          price: 25.99,
        },
      ];

      mockOrder.mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const products = await searchProducts('rosa');

      expect(products).toHaveLength(1);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Rosa Roja',
          category: 'Rosas',
          is_active: true,
        },
      ];

      mockOrder.mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const products = await getProductsByCategory('Rosas');

      expect(products).toHaveLength(1);
      expect(products[0].category).toBe('Rosas');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('products');
    });
  });
});
