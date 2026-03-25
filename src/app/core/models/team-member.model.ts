export interface TeamMember {
  id:        string;
  name:      string;
  user:      string;
  role:      string;
  createdAt: Date;
}

export interface TeamMemberList {
  data:  TeamMember[];
  total: number;
}
