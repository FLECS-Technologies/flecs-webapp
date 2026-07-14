import { setupServer } from 'msw/node';
import { getAppsMock } from '@generated/core/apps/apps.msw';
import { getInstancesMock } from '@generated/core/instances/instances.msw';
import {
  getGetManifestsAppNameVersionMockHandler,
  getGetManifestsMockHandler,
} from '@generated/core/manifests/manifests.msw';
import { getSystemMock } from '@generated/core/system/system.msw';
import { getDeviceMock } from '@generated/core/device/device.msw';
import { getQuestsMock } from '@generated/core/quests/quests.msw';
import { getConsoleMock } from '@generated/core/console/console.msw';
import { getExperimentalMock } from '@generated/core/experimental/experimental.msw';
import { getDeploymentsMock } from '@generated/core/deployments/deployments.msw';
import { getFlecsportMock } from '@generated/core/flecsport/flecsport.msw';
import { getJobsMock } from '@generated/core/jobs/jobs.msw';

// All handlers generated from OpenAPI specs.
export const server = setupServer(
  ...getAppsMock(),
  ...getInstancesMock(),
  getGetManifestsMockHandler([]),
  getGetManifestsAppNameVersionMockHandler((info) => ({
    _schemaVersion: '3.0.0',
    app: String(info.params.appName),
    version: String(info.params.version),
    image: 'test/image:latest',
    multiInstance: false,
  })),
  ...getSystemMock(),
  ...getDeviceMock(),
  ...getQuestsMock(),
  ...getConsoleMock(),
  ...getExperimentalMock(),
  ...getDeploymentsMock(),
  ...getFlecsportMock(),
  ...getJobsMock(),
);
