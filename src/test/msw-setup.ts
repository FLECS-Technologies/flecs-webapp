import { setupServer } from 'msw/node';
import { getAppsMock } from '@generated/apps/apps.msw';
import { getInstancesMock } from '@generated/instances/instances.msw';
import { getSystemMock } from '@generated/system/system.msw';
import { getDeviceMock } from '@generated/device/device.msw';
import { getQuestsMock } from '@generated/quests/quests.msw';
import { getConsoleMock } from '@generated/console/console.msw';
import { getExperimentalMock } from '@generated/experimental/experimental.msw';
import { getDeploymentsMock } from '@generated/deployments/deployments.msw';
import { getFlecsportMock } from '@generated/flecsport/flecsport.msw';
import { getJobsMock } from '@generated/jobs/jobs.msw';
import { getManifestsMock } from '@generated/manifests/manifests.msw';

// All handlers generated from OpenAPI specs — zero manual mocks
export const server = setupServer(
  ...getAppsMock(),
  ...getInstancesMock(),
  ...getSystemMock(),
  ...getDeviceMock(),
  ...getQuestsMock(),
  ...getConsoleMock(),
  ...getExperimentalMock(),
  ...getDeploymentsMock(),
  ...getFlecsportMock(),
  ...getJobsMock(),
  ...getManifestsMock(),
);
