export interface appKey {
  version: string;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface App {
  app: string;
  appKey: appKey;
  title: string;
  installedVersions: Array<string>;
  avatar?: string;
  author?: string;
  version?: string;
  versions?: string[];
  description?: string;
  short_description?: string;
  status?: string;
  availability?: string;
  instances?: any[];
  relatedLinks?: any[];
  requirement?: string[];
  categories?: Category[];
  id?: number;
  average_rating?: string;
  rating_count?: number;
  blacklist?: string[];
  price?: string;
  purchasable?: boolean;
  permalink?: string;
  documentationUrl?: string;
}
