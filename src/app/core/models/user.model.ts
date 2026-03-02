export interface User {
    id:        string;
    email:     string;
    name:      string;
    createdAt: Date;
    roles?:    string[];
}

export interface Credentials {
  email: string;
  password: string;
}
