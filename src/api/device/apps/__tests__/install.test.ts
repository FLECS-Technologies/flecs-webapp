import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { InstallAppAPI } from '../install'

vi.mock('axios')
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> }

describe('InstallAppAPI', () => {
  beforeEach(() => {
    mockedAxios.post = vi.fn()
  })

  it('returns jobId on success', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { jobId: 99 } })
    const jobId = await InstallAppAPI('my-app', '1.2.3')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/apps'),
      JSON.stringify({ appKey: { name: 'my-app', version: '1.2.3' } })
    )
    expect(jobId).toBe(99)
  })

  it('rejects on error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('fail'))
    await expect(InstallAppAPI('my-app', '1.2.3')).rejects.toThrow('fail')
  })
})