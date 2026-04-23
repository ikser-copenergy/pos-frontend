import { apiFetch } from "@/api/client";

export interface TopProductRow {
  productId: string;
  productName: string;
  sku: string | null;
  quantitySold: number;
  revenue: number;
}

export interface ExpiringSoonRow {
  productId: string;
  productName: string;
  sku: string | null;
  locationId: string;
  locationName: string;
  quantity: number;
  expiresAt: string;
  daysLeft: number;
}

export interface SalesByUserRow {
  userId: string;
  userName: string;
  userEmail: string;
  saleCount: number;
  totalRevenue: number;
}

export interface TopProductsQuery {
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  limit?: number;
  sort?: "quantity" | "revenue";
}

function buildQuery(q: TopProductsQuery) {
  const params = new URLSearchParams();
  params.set("dateFrom", q.dateFrom);
  params.set("dateTo", q.dateTo);
  if (q.locationId) params.set("locationId", q.locationId);
  if (q.limit != null) params.set("limit", String(q.limit));
  if (q.sort) params.set("sort", q.sort);
  return params.toString();
}

export interface ExpiringSoonQuery {
  days: number;
  locationId?: string;
  includeExpired?: boolean;
  limit?: number;
}

function buildExpiringQuery(q: ExpiringSoonQuery) {
  const params = new URLSearchParams();
  params.set("days", String(q.days));
  if (q.locationId) params.set("locationId", q.locationId);
  if (q.includeExpired === false) params.set("includeExpired", "false");
  if (q.limit != null) params.set("limit", String(q.limit));
  return params.toString();
}

export interface SalesByUserQuery {
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  limit?: number;
  sort?: "count" | "revenue";
}

function buildSalesByUserQuery(q: SalesByUserQuery) {
  const params = new URLSearchParams();
  params.set("dateFrom", q.dateFrom);
  params.set("dateTo", q.dateTo);
  if (q.locationId) params.set("locationId", q.locationId);
  if (q.limit != null) params.set("limit", String(q.limit));
  if (q.sort) params.set("sort", q.sort);
  return params.toString();
}

export const reportsApi = {
  getTopProducts: (query: TopProductsQuery): Promise<TopProductRow[]> => {
    const qs = buildQuery(query);
    return apiFetch<TopProductRow[]>(`/reports/top-products?${qs}`);
  },

  getExpiringSoon: (query: ExpiringSoonQuery): Promise<ExpiringSoonRow[]> => {
    const qs = buildExpiringQuery(query);
    return apiFetch<ExpiringSoonRow[]>(`/reports/expiring-soon?${qs}`);
  },

  getSalesByUser: (query: SalesByUserQuery): Promise<SalesByUserRow[]> => {
    const qs = buildSalesByUserQuery(query);
    return apiFetch<SalesByUserRow[]>(`/reports/sales-by-user?${qs}`);
  },
};
