export interface appKey {
  version: string;
  name: string;
}

export interface App {
  app: string;
  appKey: appKey;
  title: string;
  installedVersions: Array<string>;
}
