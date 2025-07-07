/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 24 2022
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JobsAPI from '../JobsAPI';
import { DeviceAPIConfiguration } from '../../api-config';

// Define the mock class INSIDE the factory function
vi.mock('../BaseAPI', () => {
  class MockBaseAPI {
    callAPI = vi.fn();
  }
  return { default: MockBaseAPI };
});

describe('JobsAPI', () => {
  let jobsAPI: JobsAPI;

  beforeEach(() => {
    jobsAPI = new JobsAPI();
    (jobsAPI as any).callAPI.mockReset();
  });

  it('calls callAPI with correct args for getJobs', async () => {
    await jobsAPI.getJobs();
    expect((jobsAPI as any).callAPI).toHaveBeenCalledWith(DeviceAPIConfiguration.JOBS_ROUTE, {
      method: 'GET',
    });
  });

  it('calls callAPI with correct args for getJob', async () => {
    await jobsAPI.getJob(42);
    expect((jobsAPI as any).callAPI).toHaveBeenCalledWith(DeviceAPIConfiguration.GET_JOB_URL(42), {
      method: 'GET',
    });
  });

  it('calls callAPI with correct args for deleteJob', async () => {
    await jobsAPI.deleteJob(99);
    expect((jobsAPI as any).callAPI).toHaveBeenCalledWith(
      DeviceAPIConfiguration.DELETE_JOB_URL(99),
      { method: 'DELETE' },
    );
  });

  it('handles errors gracefully', async () => {
    (jobsAPI as any).callAPI.mockRejectedValueOnce(new Error('fail'));
    await expect(jobsAPI.getJobs()).resolves.toBeUndefined();
    await expect(jobsAPI.getJob(1)).resolves.toBeUndefined();
    await expect(jobsAPI.deleteJob(1)).resolves.toBeUndefined();
  });
});
