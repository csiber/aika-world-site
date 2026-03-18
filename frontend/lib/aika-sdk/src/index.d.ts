export interface AikaAppConfig {
  /** Unique app identifier, e.g. 'aika-core' */
  key: string;
  /** Display name */
  title: string;
  /** i18n descriptions */
  description: { en: string; hu?: string };
  /** Emoji or URL */
  icon?: string;
  /** Card background theme */
  theme?: 'hacker' | 'space' | 'city' | 'racing' | 'life' | 'social' | string;
  /** Default: 'free' */
  access_type?: 'free' | 'pro' | 'vip';
  version?: string;
  /** Default: 'https://aikahub.com' */
  hubUrl?: string;
  /** Relative path to app's admin UI */
  adminPanel?: string;
}

export interface AikaUser {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  tier: string;
  /** Token expiry timestamp */
  exp: number;
}

export declare class AikaSDK {
  static init(config: AikaAppConfig): AikaSDK;
  requireAuth(): Promise<AikaUser>;
  getUser(): AikaUser | null;
  getToken(): string | null;
  isAuthenticated(): boolean;
  logout(): void;
  fetch(path: string, options?: RequestInit): Promise<Response>;
  onAuthChange(callback: (user: AikaUser | null) => void): () => void;
  getHubUrl(): string;
  getConfig(): AikaAppConfig;
}

export declare function getUser(): AikaUser | null;
export declare function getToken(): string | null;
export declare function clearAuth(): void;
