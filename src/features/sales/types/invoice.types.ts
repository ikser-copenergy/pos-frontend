import type { Sale } from "./sale.types";

export interface Invoice {
  id: string;
  tenantId: string;
  saleId: string;
  number: string;
  customerName?: string | null;
  customerRTN?: string | null;
  total: number;
  tax?: number | null;
  createdAt: string;
  sale: Sale;
}

export interface CreateInvoiceInput {
  tenantId: string;
  saleId: string;
  total: number;
  tax?: number;
  customerName?: string;
  customerRTN?: string;
}
