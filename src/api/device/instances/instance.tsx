import axios from 'axios'
import { DeviceAPIConfiguration } from '../../api-config'
import { job_meta } from '../../../models/job'

export interface AppInstance {
  instanceId: string
  instanceName: string
  appKey: AppKey
  status: string
  desired: string
  editors: Editor[]
}

export interface AppKey {
  name: string
  version: string
}

export interface Editor {
  name: string
  url: string
  supportsReverseProxy: boolean
}

export async function UpdateInstanceAPI(instanceId: string, to: string) {
  return axios
    .patch(
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.PATCH_INSTANCE_UPDATE_URL(instanceId),
      { to }
    )
    .then((response) => {
      return (response.data as job_meta).jobId
    })
    .catch((error) => {
      return Promise.reject(error)
    })
}

export async function UpdateInstances(
  instances: AppInstance[],
  to: string
): Promise<number[]> {
  if (instances.length === 0) {
    return []
  }

  const responses = await Promise.all(
    instances.map(async (instance) => {
      const jobId = await UpdateInstanceAPI(instance.instanceId, to)
      return jobId
    })
  )

  return responses
}
