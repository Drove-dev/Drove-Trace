export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface PaginatedRoles {
  data: Role[];
  total: number;
}
