import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const SuperAdminSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  password: z.string(),
});

export type SuperAdmin = z.infer<typeof SuperAdminSchema>;

export const fenceKeys = {
  superAdmin: (baseURL: string) => ['fence', baseURL, 'super-admin'] as const,
};

async function fenceFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fence error (${res.status})`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function useSuperAdminExists(baseURL: string | undefined) {
  return useQuery({
    queryKey: fenceKeys.superAdmin(baseURL ?? ''),
    enabled: !!baseURL,
    queryFn: async () => {
      const res = await fetch(`${baseURL}/users/super-admin`);
      if (res.status === 404) return false;
      if (!res.ok) throw new Error(`Fence error (${res.status})`);
      return true;
    },
    retry: false,
  });
}

export function useCreateSuperAdmin(baseURL: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SuperAdmin) =>
      fenceFetch(`${baseURL}/users/super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SuperAdminSchema.parse(body)),
      }),
    onSuccess: () => {
      if (baseURL) queryClient.invalidateQueries({ queryKey: fenceKeys.superAdmin(baseURL) });
    },
  });
}
