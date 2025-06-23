import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { UpdateInstanceAPI, UpdateInstances, AppInstance } from '../instance'

vi.mock('axios')
const mockedAxios = axios as unknown as { patch: ReturnType<typeof vi.fn> }

describe('UpdateInstanceAPI', () => {
  beforeEach(() => {
    mockedAxios.patch = vi.fn()
  })

  it('returns jobId on success', async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { jobId: 42 } })
    const jobId = await UpdateInstanceAPI('abc123', 'running')
    expect(mockedAxios.patch).toHaveBeenCalled()
    expect(jobId).toBe(42)
  })

  it('rejects on error', async () => {
    mockedAxios.patch.mockRejectedValueOnce(new Error('fail'))
    await expect(UpdateInstanceAPI('abc123', 'stopped')).rejects.toThrow('fail')
  })
})

describe('UpdateInstances', () => {
  const instances: AppInstance[] = [
    {
      instanceId: 'id1',
      instanceName: 'inst1',
      appKey: { name: 'foo', version: '1.0' },
      status: 'running',
      desired: 'stopped',
      editors: []
    },
    {
      instanceId: 'id2',
      instanceName: 'inst2',
      appKey: { name: 'bar', version: '2.0' },
      status: 'running',
      desired: 'stopped',
      editors: []
    }
  ]

  beforeEach(() => {
    mockedAxios.patch = vi.fn()
  })

  it('returns empty array if no instances', async () => {
    const result = await UpdateInstances([], 'stopped')
    expect(result).toEqual([])
    expect(mockedAxios.patch).not.toHaveBeenCalled()
  })

  it('returns jobIds for all instances', async () => {
    mockedAxios.patch
      .mockResolvedValueOnce({ data: { jobId: 1 } })
      .mockResolvedValueOnce({ data: { jobId: 2 } })

    const result = await UpdateInstances(instances, 'stopped')
    expect(mockedAxios.patch).toHaveBeenCalledTimes(2)
    expect(result).toEqual([1, 2])
  })

  it('rejects if any update fails', async () => {
    mockedAxios.patch
      .mockResolvedValueOnce({ data: { jobId: 1 } })
      .mockRejectedValueOnce(new Error('fail'))

    await expect(UpdateInstances(instances, 'stopped')).rejects.toThrow('fail')
  })
})