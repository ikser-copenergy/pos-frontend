export interface Setting {
  id: string;
  tenantId: string;
  key: string;
  value: string;
  createdAt?: string;
}

export interface UpsertSettingInput {
  tenantId: string;
  key: string;
  value: string;
}
