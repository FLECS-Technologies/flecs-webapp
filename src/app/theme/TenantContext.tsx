import { createContext, useContext } from 'react';
import type { TenantConfig } from '../../tenant';

export const TENANT_DEFAULTS: TenantConfig = {
  app_title: 'FLECS',
  company_name: 'FLECS',
  features: { powered_by_flecs: true },
};

export const TenantContext = createContext<TenantConfig>(TENANT_DEFAULTS);

export const useTenant = () => useContext(TenantContext);
