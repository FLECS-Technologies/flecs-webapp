import axios from 'axios'
import { DeviceAPIConfiguration } from '../../../api-config'
import { job_meta } from '../../../../models/job'
import { UpdateInstanceAPI, UpdateInstances, AppInstance } from '../instance' // Adjust the import path

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('UpdateInstanceAPI', () => {
  it('should return jobId on successful API call', async () => {
    const instanceId = 'testInstance'
    const to = 'desiredState'
    const jobId = 12345

    const response = { data: { jobId } } as { data: job_meta }
    mockedAxios.patch.mockResolvedValue(response)

    const result = await UpdateInstanceAPI(instanceId, to)
    expect(result).toEqual(jobId)
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.PATCH_INSTANCE_UPDATE_URL(instanceId),
      { to }
    )
  })

  it('should handle errors correctly', async () => {
    const instanceId = 'testInstance'
    const to = 'desiredState'
    const errorMessage = 'Request failed with status code 500'

    mockedAxios.patch.mockRejectedValue(new Error(errorMessage))

    await expect(UpdateInstanceAPI(instanceId, to)).rejects.toThrow(
      errorMessage
    )
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.PATCH_INSTANCE_UPDATE_URL(instanceId),
      { to }
    )
  })
})

describe('UpdateInstances', () => {
  it('should return jobIds on successful API calls', async () => {
    const instances: AppInstance[] = [
      {
        instanceId: 'id1',
        instanceName: 'name1',
        appKey: { name: 'app1', version: 'v1' },
        status: 'running',
        desired: 'desired1',
        editors: []
      },
      {
        instanceId: 'id2',
        instanceName: 'name2',
        appKey: { name: 'app2', version: 'v2' },
        status: 'running',
        desired: 'desired2',
        editors: []
      }
    ]
    const to = 'desiredState'
    const jobIds = [12345, 67890]

    mockedAxios.patch
      .mockResolvedValueOnce({ data: { jobId: jobIds[0] } })
      .mockResolvedValueOnce({ data: { jobId: jobIds[1] } })

    const result = await UpdateInstances(instances, to)
    expect(result).toEqual(jobIds)
    expect(mockedAxios.patch).toHaveBeenCalledTimes(instances.length)
    instances.forEach((instance, index) => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        DeviceAPIConfiguration.TARGET +
          DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
          DeviceAPIConfiguration.PATCH_INSTANCE_UPDATE_URL(instance.instanceId),
        { to }
      )
    })
  })

  it('should handle empty instances array', async () => {
    const instances: AppInstance[] = []
    const to = 'desiredState'

    const result = await UpdateInstances(instances, to)
    expect(result).toEqual([])
    expect(mockedAxios.patch).not.toHaveBeenCalled()
  })

  it('should handle errors correctly', async () => {
    const instances: AppInstance[] = [
      {
        instanceId: 'id1',
        instanceName: 'name1',
        appKey: { name: 'app1', version: 'v1' },
        status: 'running',
        desired: 'desired1',
        editors: []
      },
      {
        instanceId: 'id2',
        instanceName: 'name2',
        appKey: { name: 'app2', version: 'v2' },
        status: 'running',
        desired: 'desired2',
        editors: []
      }
    ]
    const to = 'desiredState'
    const errorMessage = 'Request failed with status code 500'

    mockedAxios.patch
      .mockResolvedValueOnce({ data: { jobId: 12345 } })
      .mockRejectedValueOnce(new Error(errorMessage))

    await expect(UpdateInstances(instances, to)).rejects.toThrow(errorMessage)
    expect(mockedAxios.patch).toHaveBeenCalledTimes(instances.length)
  })
})
