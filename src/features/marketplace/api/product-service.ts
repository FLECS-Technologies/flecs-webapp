import { decodeHtmlEntities, sanitizeHtml } from '@app/html-utils';
import type { ProductAttribute, ProductCategory, ProductMetadataValue } from '@generated/console/schemas';

// WooCommerce product field accessors.
// The marketplace API returns meta_data with `key`, but the generated ProductMetadata
// schema uses `name`. Accept both shapes so callers can pass generated `Product` directly.

interface WCMetaItem {
  key?: string;
  name?: string;
  value?: string | string[] | Record<string, string> | ProductMetadataValue;
}

export interface WCProduct {
  id?: number;
  name?: string;
  description?: string;
  short_description?: string;
  average_rating?: string;
  rating_count?: number;
  categories?: ProductCategory[];
  attributes?: ProductAttribute[];
  meta_data?: WCMetaItem[];
  stock_status?: string;
  permalink?: string;
  price?: string;
  purchasable?: boolean;
}

const meta = (app: WCProduct, key: string) => app?.meta_data?.find((o) => (o.key ?? o.name) === key)?.value;
const attr = (app: WCProduct, name: string) => app?.attributes?.find((o) => o.name === name)?.options;

export const getReverseDomainName = (app: WCProduct): string | undefined => attr(app, 'reverse-domain-name')?.[0];
export const getAppIcon = (app: WCProduct): string | undefined => {
  const url = meta(app, 'app-icon');
  return typeof url === 'string' ? url.replace('http://', 'https://') : undefined;
};
export const getAuthor = (app: WCProduct) => { const v = meta(app, 'port-author-name'); return typeof v === 'string' ? decodeHtmlEntities(v) : undefined; };
export const getVersions = (app: WCProduct): string[] | undefined => {
  const v = attr(app, 'versions');
  return v?.sort(new Intl.Collator('en', { numeric: true, sensitivity: 'base' }).compare).reverse();
};
export const getCustomLinks = (app: WCProduct): string[] | undefined => {
  const links = meta(app, 'app-custom-link');
  if (!links) return undefined;
  if (Array.isArray(links)) return links;
  if (typeof links === 'object' && links !== null && '1' in links) return [(links as Record<string, string>)['1']];
  return undefined;
};
export const getDocumentationUrl = (app: WCProduct): string | undefined => {
  const val = meta(app, '_documentation_url');
  return typeof val === 'string' ? val : undefined;
};
export const getShortDescription = (app: WCProduct) => sanitizeHtml(decodeHtmlEntities(app?.short_description || ''));
export const getDescription = (app: WCProduct) => sanitizeHtml(decodeHtmlEntities(app?.description || ''));
export const isBlacklisted = (systemInfo: { platform?: string } | null | undefined, blacklist: string[] | undefined) =>
  systemInfo?.platform ? (blacklist?.includes(systemInfo.platform) ?? false) : false;
export const getBlacklist = (app: WCProduct) => attr(app, 'blacklist');
export const getPrice = (app: WCProduct) => app?.price;
export const getPermalink = (app: WCProduct) => app?.permalink;
export const getPurchasable = (app: WCProduct) => app?.purchasable;
export const getCategories = (app: WCProduct) => app?.categories;
export const getId = (app: WCProduct) => app?.id;
export const getAverageRating = (app: WCProduct) => app?.average_rating;
export const getRatingCount = (app: WCProduct) => app?.rating_count;
export const getRequirement = (app: WCProduct) => attr(app, 'archs');
export const getVersion = (app: WCProduct) => meta(app, 'port-version');
