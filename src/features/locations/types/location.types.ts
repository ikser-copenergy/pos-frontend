export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address?: string | null;
  isMain: boolean;
  createdAt: string;
}

export interface CreateLocationInput {
  tenantId: string;
  name: string;
  address?: string;
  isMain?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string;
  isMain?: boolean;
}
