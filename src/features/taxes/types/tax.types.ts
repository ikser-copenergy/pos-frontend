export interface Tax {
  id: string;
  tenantId: string;
  name: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxInput {
  tenantId: string;
  name: string;
  rate: number;
}

export interface UpdateTaxInput {
  name?: string;
  rate?: number;
}
