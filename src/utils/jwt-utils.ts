import { JWTHeader, User } from '@contexts/auth/oauth/types';

// Utility function to decode JWT token
export const decodeJwt = (
  token: string,
): { header: Partial<JWTHeader>; payload: Partial<User> } => {
  try {
    const [header, payload] = token.split('.');
    const decodedHeader = JSON.parse(atob(header.replace(/-/g, '+').replace(/_/g, '/')));
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return { header: decodedHeader, payload: decodedPayload };
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return { header: {}, payload: {} };
  }
};
