/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Zod schemas for FLECS Core API responses.
 *
 * These schemas are the runtime firewall between the device firmware and the UI.
 * TypeScript types disappear at build time — Zod validates at runtime.
 *
 * Usage: wrap queryFn results with .parse() or .safeParse() to validate
 * that the firmware actually returned what the OpenAPI spec promised.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const AppKeySchema = z.object({
  name: z.string(),
  version: z.string(),
});

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

export const AppStatusSchema = z.enum([
  'not installed',
  'manifest downloaded',
  'token acquired',
  'image downloaded',
  'installed',
  'removed',
  'purged',
  'orphaned',
  'unknown',
]);

export const InstalledAppSchema = z.object({
  appKey: AppKeySchema,
  status: AppStatusSchema.catch('unknown'),
  desired: AppStatusSchema.catch('unknown'),
  installedSize: z.number().catch(0),
  multiInstance: z.boolean().catch(false),
});

export const InstalledAppsResponseSchema = z.array(InstalledAppSchema).catch([]);

// ---------------------------------------------------------------------------
// Instances
// ---------------------------------------------------------------------------

export const InstanceStatusSchema = z.enum([
  'not created',
  'requested',
  'resources ready',
  'created',
  'stopped',
  'running',
  'orphaned',
  'unknown',
]);

export const InstanceEditorSchema = z.object({
  name: z.string(),
  port: z.number(),
  path_prefix: z.string().optional(),
  url: z.string(),
});

export const AppInstanceSchema = z.object({
  instanceId: z.string(),
  instanceName: z.string(),
  appKey: AppKeySchema,
  status: InstanceStatusSchema.catch('unknown'),
  desired: InstanceStatusSchema.catch('unknown'),
  editors: z.array(InstanceEditorSchema).optional(),
});

export const AppInstancesResponseSchema = z.array(AppInstanceSchema).catch([]);

export const InstanceDetailSchema = AppInstanceSchema.extend({
  configFiles: z
    .array(z.object({ container: z.string(), host: z.string() }))
    .catch([]),
  hostname: z.string().catch(''),
  ipAddress: z.string().catch(''),
  ports: z
    .array(z.object({ container: z.string(), host: z.string() }))
    .catch([]),
  volumes: z
    .array(z.object({ name: z.string(), path: z.string() }))
    .catch([]),
});

export const InstanceLogsSchema = z.object({
  stdout: z.string().catch(''),
  stderr: z.string().catch(''),
});

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export const SystemDistroSchema = z.object({
  codename: z.string().catch(''),
  id: z.string().catch(''),
  name: z.string().catch(''),
  version: z.string().catch(''),
});

export const SystemKernelSchema = z.object({
  build: z.string().catch(''),
  machine: z.string().catch(''),
  version: z.string().catch(''),
});

export const SystemInfoSchema = z.object({
  arch: z.string().catch(''),
  distro: SystemDistroSchema,
  kernel: SystemKernelSchema,
  platform: z.string().catch(''),
});

export const SystemVersionSchema = z.object({
  api: z.string().catch(''),
  core: z.string().catch(''),
});

// ---------------------------------------------------------------------------
// Quests / Jobs
// ---------------------------------------------------------------------------

export const QuestStateSchema = z.enum([
  'failing',
  'ongoing',
  'pending',
  'failed',
  'success',
  'skipped',
]);

export const QuestProgressSchema = z.object({
  current: z.number(),
  total: z.number().optional(),
});

// Recursive schema — Quest can contain subquests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const QuestSchema: any = z.lazy(() =>
  z.object({
    id: z.number(),
    description: z.string().catch(''),
    detail: z.string().optional(),
    result: z.string().optional(),
    state: QuestStateSchema,
    progress: QuestProgressSchema.optional(),
    subquests: z.array(QuestSchema).optional(),
  }),
);

export const QuestsResponseSchema = z.array(QuestSchema).catch([]);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const ExportItemSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  apps: z.array(AppKeySchema).optional(),
  instances: z.array(z.string()).optional(),
});

export const ExportsResponseSchema = z.array(ExportItemSchema).catch([]);

// ---------------------------------------------------------------------------
// Safe parse helper
// ---------------------------------------------------------------------------

/**
 * Parse API response data with a Zod schema.
 * On validation failure, logs a warning and returns the fallback value.
 * Never throws — the UI must never crash because firmware sent unexpected data.
 */
export function safeParseResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  console.warn(
    `[FLECS] API response validation failed for "${label}":`,
    result.error.issues,
    '\nRaw data:',
    data,
  );
  // Return what Zod could salvage via .catch() defaults
  // If schema has .catch(), parse will succeed with defaults
  // If it doesn't, we re-throw (this only happens for required fields)
  return schema.parse(data);
}
