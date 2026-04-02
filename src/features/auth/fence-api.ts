import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthProviderURL } from '@app/api/ApiProvider';
import { getProvidersAuth } from '@generated/core/experimental/experimental';
import type { AuthProvidersAndDefaults } from '@generated/core/schemas';
import { extractCoreProviderId } from '@features/onboarding/OnboardingGuard';

// ── Fence base URL (dynamic — resolved from core API at runtime) ──

let _cachedBaseURL: string | null = null;

async function getFenceBaseURL(): Promise<string> {
  if (_cachedBaseURL) return _cachedBaseURL;
  const res = await getProvidersAuth();
  const coreId = extractCoreProviderId(res.data as AuthProvidersAndDefaults);
  if (!coreId) throw new Error('No auth provider configured');
  _cachedBaseURL = getAuthProviderURL(coreId);
  return _cachedBaseURL;
}

// ── Types ──

export interface SuperAdmin {
  name: string;
  full_name: string;
  password: string;
}

// ── Hooks (same pattern as orval-generated) ──

export function useSuperAdminExists() {
  return useQuery({
    queryKey: ['super-admin'],
    queryFn: async () => {
      const base = await getFenceBaseURL();
      const res = await fetch(`${base}/users/super-admin`).catch(() => ({ status: 502 }) as Response);
      if (res.status === 404 || res.status === 502) return false;
      if (!('ok' in res) || !res.ok) throw new Error(`Fence check failed (${res.status})`);
      return true;
    },
    retry: false,
  });
}

export function useCreateSuperAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (admin: SuperAdmin) => {
      const base = await getFenceBaseURL();
      const res = await fetch(`${base}/users/super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      });
      if (!res.ok) throw new Error(`Super admin creation failed (${res.status})`);
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin'] });
    },
  });
}
