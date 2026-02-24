export interface UserWithRole {
  id: string;
  email: string;
  role: {
    id: string;
    role: string;
  }[];
}
