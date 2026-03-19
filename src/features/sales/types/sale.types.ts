export interface SaleItemProduct {
  id: string;
  name: string;
  salePrice?: number | null;
}

export interface SaleItemVariant {
  id: string;
  name: string;
  salePrice?: number | null;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  product?: SaleItemProduct;
  variant?: SaleItemVariant | null;
}

export interface Payment {
  id: string;
  saleId: string;
  method: "CASH" | "TRANSFER" | "CARD";
  amount: number;
  reference?: string | null;
}

export interface SaleInvoice {
  id: string;
  number: string;
  customerName?: string | null;
  customerRTN?: string | null;
  total: number;
  tax?: number | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  tenantId: string;
  locationId: string;
  userId: string;
  customerId?: string | null;
  total: number;
  tax?: number | null;
  discount?: number | null;
  status?: string | null;
  createdAt: string;
  items: SaleItem[];
  payments: Payment[];
  customer?: { id: string; name: string } | null;
  location?: { id: string; name: string };
  user?: { id: string; name: string };
  invoice?: SaleInvoice | null;
}

export interface CreateSaleInput {
  tenantId: string;
  locationId: string;
  userId: string;
  customerId?: string;
  total: number;
  tax?: number;
  discount?: number;
  items: { productId: string; variantId?: string; quantity: number; unitPrice: number; total: number }[];
  payments: { method: "CASH" | "TRANSFER" | "CARD"; amount: number; reference?: string }[];
}
