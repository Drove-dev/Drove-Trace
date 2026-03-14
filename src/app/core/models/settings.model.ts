export interface TeamSettings {
  id: string;
  name: string;
  slug: string;
}

export interface NotificationSettings {
  errorThresholdAlerts: boolean;
  weeklyDigestEmail: boolean;
  newMemberAlerts: boolean;
}
