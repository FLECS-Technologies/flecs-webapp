import { create } from 'zustand';
import { MarketplaceUser } from '@features/marketplace/types';

interface MarketplaceUserState {
  user: MarketplaceUser | null;
  /** True for one render after setUser is called (login/logout event). */
  userChanged: boolean;

  setUser: (user: MarketplaceUser | null) => void;

  // Auth header helpers — derived from user.jwt.token
  authHeaderUseBearer: () => Record<string, string>;
  authorizationHeaderUseBearer: () => Record<string, string>;
  authHeaderUseXAccess: () => Record<string, string>;
  jwt: () => string;
}

export const useMarketplaceUser = create<MarketplaceUserState>()((set, get) => ({
  user: null,
  userChanged: false,

  setUser: (user) => {
    set({ user, userChanged: true });
    // Reset userChanged after one tick so consumers see a single pulse
    queueMicrotask(() => set({ userChanged: false }));
  },

  authHeaderUseBearer: () => {
    const { user } = get();
    return user?.jwt?.token ? { Authentication: 'Bearer ' + user.jwt.token } : {};
  },

  authorizationHeaderUseBearer: () => {
    const { user } = get();
    return user?.jwt?.token ? { Authorization: 'Bearer ' + user.jwt.token } : {};
  },

  authHeaderUseXAccess: () => {
    const { user } = get();
    return user?.jwt?.token ? { 'x-access-token': user.jwt.token } : {};
  },

  jwt: () => {
    const { user } = get();
    return user?.jwt?.token ?? '';
  },
}));
