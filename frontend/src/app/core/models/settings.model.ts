export interface TeamMembership {
  teamId: string;
  teamName: string;
  role: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  teams: TeamMembership[];
}

export interface TeamProfile {
  id: string;
  name: string;
}

export interface UpdateUserPayload {
  name?: string;
  password?: string;
}

export interface UpdateTeamPayload {
  name: string;
}
