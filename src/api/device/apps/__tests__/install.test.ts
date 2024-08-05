import axios from 'axios'
import { InstallAppAPI } from '../install' // Adjust the import path
import { DeviceAPIConfiguration } from '../../../api-config'
import { job_meta } from '../../../../types/job'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('InstallAppAPI', () => {
  it('should return jobId on successful API call', async () => {
    const app = 'testApp'
    const version = '1.0.0'
    const jobId = 12345

    const response = { data: { jobId } } as { data: job_meta }
    mockedAxios.post.mockResolvedValue(response)

    const result = await InstallAppAPI(app, version)
    expect(result).toEqual(jobId)
    expect(mockedAxios.post).toHaveBeenCalledWith(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.APP_ROUTE +
        DeviceAPIConfiguration.POST_INSTALL_APP_URL,
      JSON.stringify({ appKey: { name: app, version } })
    )
  })

  it('should handle errors correctly', async () => {
    const app = 'testApp'
    const version = '1.0.0'
    const errorMessage = 'Request failed with status code 500'

    mockedAxios.post.mockRejectedValue(new Error(errorMessage))

    await expect(InstallAppAPI(app, version)).rejects.toThrow(errorMessage)
    expect(mockedAxios.post).toHaveBeenCalledWith(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.APP_ROUTE +
        DeviceAPIConfiguration.POST_INSTALL_APP_URL,
      JSON.stringify({ appKey: { name: app, version } })
    )
  })
})
