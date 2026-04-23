export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
  tenantLogoUrl?: string | null;
  defaultLocationId: string;
  defaultLocationName: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
