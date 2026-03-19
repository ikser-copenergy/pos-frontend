export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
