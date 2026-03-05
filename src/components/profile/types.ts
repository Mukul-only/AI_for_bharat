export interface UserProfile {
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  isGoogleSignIn: boolean;
  passwordHash?: string;
}

export interface ContentPreferences {
  niche: string;
  platforms: string[];
  targetAudience: string;
  toneStyle: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  defaultAIModel: string;
  autoSaveInterval: number;
  cloudSync: boolean;
}

export interface UsageStats {
  workflowsCreated: number;
  aiGenerationsUsed: number;
  accountCreated: string;
  lastSynced: string;
}

export type SectionId =
  | "user-info"
  | "content-preferences"
  | "app-settings"
  | "usage-stats"
  | "account-security";
