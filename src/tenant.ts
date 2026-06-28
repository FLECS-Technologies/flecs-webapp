import { z } from 'zod';
import { publicAssetPath } from './brandAssets';

// vendor_id matches DeviceLicenseManufacturer.id from the console API.
// 0 = FLECS default (no white-label vendor). OEM partners get their assigned integer from FLECS.
export const TenantConfigSchema = z.object({
  vendor_id: z.number().int().nonnegative().default(0),
  app_title: z.string().default('FLECS'),
  company_name: z.string().default('FLECS'),
  branding: z
    .object({
      show_app_title: z.boolean().default(true),
      logos: z
        .object({
          default: z.string().min(1).optional(),
          light: z.string().min(1).optional(),
          dark: z.string().min(1).optional(),
        })
        .default({}),
    })
    .default({ show_app_title: true, logos: {} }),
  features: z
    .object({
      powered_by_flecs: z.boolean().default(false),
    })
    .default({ powered_by_flecs: false }),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

export async function loadTenant(): Promise<TenantConfig> {
  try {
    const res = await fetch(publicAssetPath('config.json'));
    if (!res.ok) return TenantConfigSchema.parse({});
    const result = TenantConfigSchema.safeParse(await res.json());
    return result.success ? result.data : TenantConfigSchema.parse({});
  } catch {
    return TenantConfigSchema.parse({});
  }
}
