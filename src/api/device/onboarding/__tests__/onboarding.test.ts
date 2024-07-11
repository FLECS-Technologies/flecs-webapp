import axios from 'axios'
import { OnboardingDeviceAPI, OnboardingDeviceAPIResponse } from '../onboarding'
import { DeviceAPIConfiguration } from '../../../api-config'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('OnboardingDeviceAPI', () => {
  let mockFile: File

  beforeEach(() => {
    jest.clearAllMocks()

    const fileContent = '{"key":"value"}'
    mockFile = new File([fileContent], 'mockFile.json', {
      type: 'application/json'
    })

    // Mock the text method of File
    Object.defineProperty(mockFile, 'text', {
      value: jest.fn().mockResolvedValue(fileContent)
    })
  })

  it('should post file content and return jobId on success', async () => {
    const mockResponse = {
      data: {
        jobId: 123
      } as OnboardingDeviceAPIResponse
    }

    mockedAxios.post.mockResolvedValueOnce(mockResponse)

    const result = await OnboardingDeviceAPI(mockFile)

    expect(result).toEqual({ jobId: 123 })
    expect(mockedAxios.post).toHaveBeenCalledWith(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.POST_ONBOARDING_URL,
      { key: 'value' },
      { headers: { 'Content-Type': 'application/json' } }
    )
  })

  it('should reject with an error when the post request fails', async () => {
    const mockError = new Error('Network Error')
    mockedAxios.post.mockRejectedValueOnce(mockError)

    await expect(OnboardingDeviceAPI(mockFile)).rejects.toThrow('Network Error')
  })

  it('should reject with an error when file content cannot be parsed', async () => {
    const invalidFileContent = 'Invalid Content'
    const invalidFile = new File([invalidFileContent], 'invalidFile.json', {
      type: 'application/json'
    })

    // Mock the text method of invalidFile
    Object.defineProperty(invalidFile, 'text', {
      value: jest.fn().mockResolvedValue(invalidFileContent)
    })

    await expect(OnboardingDeviceAPI(invalidFile)).rejects.toThrow(SyntaxError)
  })
})
