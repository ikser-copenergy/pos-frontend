export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address?: string | null;
  createdAt: string;
}

export interface CreateLocationInput {
  tenantId: string;
  name: string;
  address?: string;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string;
}
