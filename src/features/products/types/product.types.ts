export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  createdAt: string;
}

export interface ProductInventoryItem {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  location: { id: string; name: string };
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
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  inventory?: ProductInventoryItem[];
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
  archived?: boolean;
  imageUrl?: string;
  inventoryByLocation?: { locationId: string; quantity: number }[];
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
  archived?: boolean;
  imageUrl?: string;
  inventoryByLocation?: { locationId: string; quantity: number }[];
}
