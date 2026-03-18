export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
}

export interface Location {
  id: string;
  name: string;
  address?: string | null;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  variantId?: string | null;
  locationId: string;
  quantity: number;
  updatedAt: string;
  product: Product;
  variant?: ProductVariant | null;
  location: Location;
}

export interface CreateInventoryInput {
  tenantId: string;
  productId: string;
  variantId?: string;
  locationId: string;
  quantity?: number;
}

export interface UpdateInventoryInput {
  quantity?: number;
}
