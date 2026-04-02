import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceState } from '@stores/device-state';
import { useQuestStore, addQuest, getQuest, getQuestsMap } from '@stores/quests';
import { useUIStore } from '@stores/ui';
import { useNotificationStore } from '@stores/notifications';
import { useMarketplaceFilters } from '@stores/marketplace-filters';
import { useMarketplaceUser } from '@stores/marketplace-user';
import type { Quest } from '@flecs/core-client-ts';

// ---------------------------------------------------------------------------
// useDeviceState
// ---------------------------------------------------------------------------
describe('useDeviceState', () => {
  beforeEach(() => {
    useDeviceState.setState(useDeviceState.getInitialState());
  });

  it('has correct initial state', () => {
    const s = useDeviceState.getState();
    expect(s.loaded).toBe(false);
    expect(s.onboarded).toBe(false);
    expect(s.authenticated).toBe(false);
  });

  it('setLoaded updates loaded', () => {
    useDeviceState.getState().setLoaded(true);
    expect(useDeviceState.getState().loaded).toBe(true);
  });

  it('setOnboarded updates onboarded', () => {
    useDeviceState.getState().setOnboarded(true);
    expect(useDeviceState.getState().onboarded).toBe(true);
  });

  it('setAuthenticated updates authenticated', () => {
    useDeviceState.getState().setAuthenticated(true);
    expect(useDeviceState.getState().authenticated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useQuestStore (reactive Zustand part)
// ---------------------------------------------------------------------------
describe('useQuestStore', () => {
  beforeEach(() => {
    useQuestStore.setState(useQuestStore.getInitialState());
  });

  it('has correct initial state', () => {
    const s = useQuestStore.getState();
    expect(s.mainQuestIds).toEqual([]);
    expect(s.fetching).toBe(false);
  });

  it('setFetching updates fetching', () => {
    useQuestStore.getState().setFetching(true);
    expect(useQuestStore.getState().fetching).toBe(true);
  });

  it('setMainQuestIds updates mainQuestIds', () => {
    useQuestStore.getState().setMainQuestIds([1, 2, 3]);
    expect(useQuestStore.getState().mainQuestIds).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// Quest map (module-level, non-reactive)
// ---------------------------------------------------------------------------
describe('quest map helpers', () => {
  beforeEach(() => {
    getQuestsMap().clear();
  });

  it('starts empty', () => {
    expect(getQuestsMap().size).toBe(0);
    expect(getQuest(1)).toBeUndefined();
  });

  it('addQuest stores a quest retrievable by getQuest', () => {
    const quest: Quest = { id: 10, description: 'Install app', state: 'ongoing' };
    addQuest(quest);
    expect(getQuest(10)).toBe(quest);
    expect(getQuestsMap().size).toBe(1);
  });

  it('addQuest recursively stores subquests', () => {
    const sub: Quest = { id: 20, description: 'Download image', state: 'pending' };
    const parent: Quest = { id: 10, description: 'Install app', state: 'ongoing', subquests: [sub] };
    addQuest(parent);
    expect(getQuest(10)).toBe(parent);
    expect(getQuest(20)).toBe(sub);
    expect(getQuestsMap().size).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// useUIStore
// ---------------------------------------------------------------------------
describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState(useUIStore.getInitialState());
  });

  it('has correct initial state', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar flips sidebarOpen', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets explicit value', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useNotificationStore
// ---------------------------------------------------------------------------
describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState(useNotificationStore.getInitialState());
  });

  it('has correct initial state', () => {
    const s = useNotificationStore.getState();
    expect(s.notifications).toEqual([]);
    expect(s.unreadCount).toBe(0);
  });

  it('addNotification pushes a notification and increments unread', () => {
    useNotificationStore.getState().addNotification({ title: 'Hello', type: 'info' });
    const s = useNotificationStore.getState();
    expect(s.notifications).toHaveLength(1);
    expect(s.notifications[0].title).toBe('Hello');
    expect(s.notifications[0].type).toBe('info');
    expect(s.notifications[0].id).toBeDefined();
    expect(s.notifications[0].timestamp).toBeGreaterThan(0);
    expect(s.unreadCount).toBe(1);
  });

  it('markAllRead resets unreadCount to 0', () => {
    useNotificationStore.getState().addNotification({ title: 'A', type: 'success' });
    useNotificationStore.getState().addNotification({ title: 'B', type: 'error' });
    expect(useNotificationStore.getState().unreadCount).toBe(2);
    useNotificationStore.getState().markAllRead();
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it('clearAll empties notifications and resets unread', () => {
    useNotificationStore.getState().addNotification({ title: 'X', type: 'warning' });
    useNotificationStore.getState().clearAll();
    const s = useNotificationStore.getState();
    expect(s.notifications).toEqual([]);
    expect(s.unreadCount).toBe(0);
  });

  it('caps notifications at 50', () => {
    for (let i = 0; i < 55; i++) {
      useNotificationStore.getState().addNotification({ title: `N${i}`, type: 'info' });
    }
    expect(useNotificationStore.getState().notifications).toHaveLength(50);
  });
});

// ---------------------------------------------------------------------------
// useMarketplaceFilters
// ---------------------------------------------------------------------------
describe('useMarketplaceFilters', () => {
  beforeEach(() => {
    useMarketplaceFilters.setState(useMarketplaceFilters.getInitialState());
  });

  it('has correct initial state', () => {
    const s = useMarketplaceFilters.getState();
    expect(s.filterParams).toEqual({ hiddenCategories: [], search: undefined, available: false, freeOnly: false, pageSize: 100 });
    expect(s.categories).toEqual([]);
    expect(s.showFilter).toBe(false);
    expect(s.isSearchEnabled).toBe(true);
    expect(s.finalProducts).toEqual([]);
  });

  it('toggleFilter flips showFilter', () => {
    useMarketplaceFilters.getState().toggleFilter();
    expect(useMarketplaceFilters.getState().showFilter).toBe(true);
    useMarketplaceFilters.getState().toggleFilter();
    expect(useMarketplaceFilters.getState().showFilter).toBe(false);
  });

  it('setAvailableFilter toggles available', () => {
    useMarketplaceFilters.getState().setAvailableFilter();
    expect(useMarketplaceFilters.getState().filterParams.available).toBe(true);
    useMarketplaceFilters.getState().setAvailableFilter();
    expect(useMarketplaceFilters.getState().filterParams.available).toBe(false);
  });

  it('setCategoryFilter toggles category in hiddenCategories', () => {
    useMarketplaceFilters.getState().setCategoryFilter(5);
    expect(useMarketplaceFilters.getState().filterParams.hiddenCategories).toEqual([5]);
    useMarketplaceFilters.getState().setCategoryFilter(5);
    expect(useMarketplaceFilters.getState().filterParams.hiddenCategories).toEqual([]);
  });

  it('setIsSearchEnabled updates isSearchEnabled', () => {
    useMarketplaceFilters.getState().setIsSearchEnabled(false);
    expect(useMarketplaceFilters.getState().isSearchEnabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// useMarketplaceUser
// ---------------------------------------------------------------------------
describe('useMarketplaceUser', () => {
  beforeEach(() => {
    useMarketplaceUser.setState(useMarketplaceUser.getInitialState());
  });

  it('has correct initial state', () => {
    const s = useMarketplaceUser.getState();
    expect(s.user).toBeNull();
    expect(s.userChanged).toBe(false);
  });

  it('setUser updates user', () => {
    const mockUser = { ID: 1, display_name: 'Test', jwt: { token: 'abc', token_expires: 9999 } };
    useMarketplaceUser.getState().setUser(mockUser);
    expect(useMarketplaceUser.getState().user).toEqual(mockUser);
  });

  it('jwt() returns token when user is set', () => {
    useMarketplaceUser.getState().setUser({ jwt: { token: 'my-token', token_expires: 0 } });
    expect(useMarketplaceUser.getState().jwt()).toBe('my-token');
  });

  it('jwt() returns empty string when no user', () => {
    expect(useMarketplaceUser.getState().jwt()).toBe('');
  });

  it('authHeaderUseBearer returns correct header', () => {
    useMarketplaceUser.getState().setUser({ jwt: { token: 'tok', token_expires: 0 } });
    expect(useMarketplaceUser.getState().authHeaderUseBearer()).toEqual({
      Authentication: 'Bearer tok',
    });
  });

  it('authorizationHeaderUseBearer returns correct header', () => {
    useMarketplaceUser.getState().setUser({ jwt: { token: 'tok', token_expires: 0 } });
    expect(useMarketplaceUser.getState().authorizationHeaderUseBearer()).toEqual({
      Authorization: 'Bearer tok',
    });
  });

  it('authHeaderUseXAccess returns correct header', () => {
    useMarketplaceUser.getState().setUser({ jwt: { token: 'tok', token_expires: 0 } });
    expect(useMarketplaceUser.getState().authHeaderUseXAccess()).toEqual({
      'x-access-token': 'tok',
    });
  });

  it('auth helpers return empty object when no user', () => {
    expect(useMarketplaceUser.getState().authHeaderUseBearer()).toEqual({});
    expect(useMarketplaceUser.getState().authorizationHeaderUseBearer()).toEqual({});
    expect(useMarketplaceUser.getState().authHeaderUseXAccess()).toEqual({});
  });
});
