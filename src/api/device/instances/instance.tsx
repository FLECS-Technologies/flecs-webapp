export interface AppInstance {
  instanceId: string
  instanceName: string
  appKey: AppKey
  status: string
  desired: string
  editor: string[]
}

export interface AppKey {
  name: string
  version: string
}
