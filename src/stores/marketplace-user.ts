import { create } from 'zustand';
import type { PostApiV2AuthLogin200Data } from '@generated/console/schemas';

type MarketplaceUser = PostApiV2AuthLogin200Data;

interface MarketplaceUserState {
  user: MarketplaceUser | null;
  userChanged: boolean;
  setUser: (user: MarketplaceUser | null) => void;
  jwt: () => string;
}

export const useMarketplaceUser = create<MarketplaceUserState>()((set, get) => ({
  user: null,
  userChanged: false,
  setUser: (user) => {
    set({ user, userChanged: true });
    queueMicrotask(() => set({ userChanged: false }));
  },
  jwt: () => get().user?.jwt?.token ?? '',
}));
