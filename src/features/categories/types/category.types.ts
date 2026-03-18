export interface Category {
  id: string;
  tenantId: string;
  name: string;
  parentId?: string | null;
}

export interface CreateCategoryInput {
  tenantId: string;
  name: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string;
}
