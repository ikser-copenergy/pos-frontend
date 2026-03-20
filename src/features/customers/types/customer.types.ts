export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt?: string;
  /** Deuda pendiente (solo en listado paginado) */
  debt?: number;
}

export interface CreateCustomerInput {
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
