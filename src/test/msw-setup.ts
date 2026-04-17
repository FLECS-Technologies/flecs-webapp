import { setupServer } from 'msw/node';
import { getAppsMock } from '@generated/core/apps/apps.msw';
import { getInstancesMock } from '@generated/core/instances/instances.msw';
import { getSystemMock } from '@generated/core/system/system.msw';
import { getDeviceMock } from '@generated/core/device/device.msw';
import { getQuestsMock } from '@generated/core/quests/quests.msw';
import { getConsoleMock } from '@generated/core/console/console.msw';
import { getExperimentalMock } from '@generated/core/experimental/experimental.msw';
import { getDeploymentsMock } from '@generated/core/deployments/deployments.msw';
import { getFlecsportMock } from '@generated/core/flecsport/flecsport.msw';
import { getJobsMock } from '@generated/core/jobs/jobs.msw';

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
);
