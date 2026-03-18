export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  type: string;
  unitType?: string | null;
  sku?: string | null;
  barcode?: string | null;
  costPrice?: number | null;
  salePrice?: number | null;
  trackStock: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface CreateProductInput {
  tenantId: string;
  name: string;
  description?: string;
  categoryId?: string;
  type: string;
  unitType?: string;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  salePrice?: number;
  trackStock?: boolean;
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  type?: string;
  unitType?: string;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  salePrice?: number;
  trackStock?: boolean;
  imageUrl?: string;
}
