import { createContext, useContext } from 'react';
import { TenantConfigSchema, type TenantConfig } from '../../tenant';

export const TenantContext = createContext<TenantConfig>(TenantConfigSchema.parse({}));

export const useTenant = () => useContext(TenantContext);
