export interface MarketplaceJWT {
  token: string;
  token_expires: number;
}

export interface MarketplaceUser {
  ID?: number;
  user_login?: string;
  user_nicename?: string;
  display_name?: string;
  user_url?: string;
  user_email?: string;
  user_registered?: string;
  jwt?: MarketplaceJWT;
}

export interface MarketplaceValidation {
  iat: number;
  iss: string;
  exp: number;
  jti: string;
  userId: number;
  revocable: boolean;
  refreshable: boolean | null;
  isValid: boolean;
}
