import api from './api';

export interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  description?: string;
  sku: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  quantity: number;
  price: number;
  category: string;
  description?: string;
  sku?: string;
}

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  categoryStats: Array<{
    _id: string;
    count: number;
    value: number;
  }>;
  lowStock: number;
}

class ProductService {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<ProductsResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data.product;
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data.product;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async getStats(): Promise<ProductStats> {
    const response = await api.get('/products/stats/overview');
    return response.data;
  }
}

export const productService = new ProductService();