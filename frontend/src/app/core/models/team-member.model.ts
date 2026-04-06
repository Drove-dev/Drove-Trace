export interface TeamMember {
  id:        string;
  name?:     string;
  user?:     string;
  role?:     string;
  createdAt: Date;
  
  // Mapped from API
  roleId?: string;
  roleNames?: string;
  teamName?: string;
  teamOwnerName?: string;
  userId?: string;
  userName?: string;
}

export interface PaginatedTeamMembers {
  data:  TeamMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTeamMemberPayload {
  teamId: string;
  userId: string;
  roleId: string;
}

export interface UpdateTeamMemberPayload {
  teamId?: string;
  userId?: string;
  roleId?: string;
}

