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
