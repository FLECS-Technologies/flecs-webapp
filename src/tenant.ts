export interface TenantConfig {
  app_title: string;
  company_name: string;
  features: {
    powered_by_flecs: boolean;
  };
}

const DEFAULTS: TenantConfig = {
  app_title: 'FLECS',
  company_name: 'FLECS',
  features: { powered_by_flecs: true },
};

export async function loadTenant(): Promise<TenantConfig> {
  try {
    const res = await fetch('/config.json');
    if (!res.ok) return DEFAULTS;
    return { ...DEFAULTS, ...(await res.json()) };
  } catch {
    return DEFAULTS;
  }
}
