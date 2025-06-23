import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { OnboardingDeviceAPI } from '../onboarding'

vi.mock('axios')
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> }

function createMockFile(content: string): File {
  return {
    text: vi.fn().mockResolvedValue(content)
  } as unknown as File
}

describe('OnboardingDeviceAPI', () => {
  beforeEach(() => {
    mockedAxios.post = vi.fn()
  })

  it('should post parsed file content and return response data', async () => {
    const fileContent = JSON.stringify({ foo: 'bar' })
    const file = createMockFile(fileContent)
    const response = { jobId: 123 }
    mockedAxios.post.mockResolvedValueOnce({ data: response })

    const result = await OnboardingDeviceAPI(file)
    expect(file.text).toHaveBeenCalled()
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/onboarding'),
      { foo: 'bar' },
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    )
    expect(result).toEqual(response)
  })

  it('should reject if axios.post fails', async () => {
    const fileContent = JSON.stringify({ foo: 'bar' })
    const file = createMockFile(fileContent)
    mockedAxios.post.mockRejectedValueOnce(new Error('fail'))

    await expect(OnboardingDeviceAPI(file)).rejects.toThrow('fail')
  })

  it('should reject if file content is invalid JSON', async () => {
    const file = createMockFile('not-json')
    await expect(OnboardingDeviceAPI(file)).rejects.toThrow()
  })
})