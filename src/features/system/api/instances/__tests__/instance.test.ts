import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { UpdateInstanceAPI, UpdateInstances, AppInstance } from '../instance';

function createMockApi() {
  return {
    instances: {
      instancesInstanceIdPatch: vi.fn(),
    },
  } as any;
}

describe('UpdateInstanceAPI', () => {
  let mockApi: any;
  beforeEach(() => {
    mockApi = createMockApi();
  });

  it('returns jobId on success', async () => {
    mockApi.instances.instancesInstanceIdPatch.mockResolvedValueOnce({ data: { jobId: 42 } });
    const jobId = await UpdateInstanceAPI('abc123', 'running', mockApi);
    expect(mockApi.instances.instancesInstanceIdPatch).toHaveBeenCalledWith('abc123', {
      to: 'running',
    });
    expect(jobId).toBe(42);
  });

  it('rejects on error', async () => {
    mockApi.instances.instancesInstanceIdPatch.mockRejectedValueOnce(new Error('fail'));
    await expect(UpdateInstanceAPI('abc123', 'stopped', mockApi)).rejects.toThrow('fail');
  });
});

describe('UpdateInstances', () => {
  const instances: AppInstance[] = [
    {
      instanceId: 'id1',
      instanceName: 'inst1',
      appKey: { name: 'foo', version: '1.0' },
      status: 'running',
      desired: 'stopped',
      editors: [],
    },
    {
      instanceId: 'id2',
      instanceName: 'inst2',
      appKey: { name: 'bar', version: '2.0' },
      status: 'running',
      desired: 'stopped',
      editors: [],
    },
  ];

  let mockApi: any;
  beforeEach(() => {
    mockApi = createMockApi();
  });

  it('returns empty array if no instances', async () => {
    const result = await UpdateInstances([], 'stopped', mockApi);
    expect(result).toEqual([]);
    expect(mockApi.instances.instancesInstanceIdPatch).not.toHaveBeenCalled();
  });

  it('returns jobIds for all instances', async () => {
    mockApi.instances.instancesInstanceIdPatch
      .mockResolvedValueOnce({ data: { jobId: 1 } })
      .mockResolvedValueOnce({ data: { jobId: 2 } });

    const result = await UpdateInstances(instances, 'stopped', mockApi);
    expect(mockApi.instances.instancesInstanceIdPatch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([1, 2]);
  });

  it('rejects if any update fails', async () => {
    mockApi.instances.instancesInstanceIdPatch
      .mockResolvedValueOnce({ data: { jobId: 1 } })
      .mockRejectedValueOnce(new Error('fail'));

    await expect(UpdateInstances(instances, 'stopped', mockApi)).rejects.toThrow('fail');
  });
});
