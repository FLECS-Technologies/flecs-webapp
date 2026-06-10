import { z } from 'zod';

// vendor_id matches DeviceLicenseManufacturer.id from the console API.
// 0 = FLECS default (no white-label vendor). OEM partners get their assigned integer from FLECS.
export const TenantConfigSchema = z.object({
  vendor_id: z.number().int().nonnegative().default(0),
  app_title: z.string().default('FLECS'),
  company_name: z.string().default('FLECS'),
  features: z
    .object({
      powered_by_flecs: z.boolean().default(true),
    })
    .default({ powered_by_flecs: true }),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

export async function loadTenant(): Promise<TenantConfig> {
  try {
    const res = await fetch('/config.json');
    if (!res.ok) return TenantConfigSchema.parse({});
    const result = TenantConfigSchema.safeParse(await res.json());
    return result.success ? result.data : TenantConfigSchema.parse({});
  } catch {
    return TenantConfigSchema.parse({});
  }
}
