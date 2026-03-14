export type SdkKeyEnvironment = 'production' | 'staging' | 'development';
export type SdkKeyStatus     = 'active' | 'inactive';

export interface SdkKey {
  id:          string;
  name:        string;
  key:         string;            // full key value, masked in UI
  project:     string;
  environment: SdkKeyEnvironment;
  status:      SdkKeyStatus;
  createdAt:   Date;
  expiresAt:   Date | null;       // null = never expires
}

export interface SdkKeyList {
  data:  SdkKey[];
  total: number;
}
