export interface Team {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsResponse {
  data: Team[];
  total: number;
}

export interface CreateTeamPayload {
  name: string;
  ownerId: string;
}

export interface UpdateTeamPayload {
  name: string;
}
