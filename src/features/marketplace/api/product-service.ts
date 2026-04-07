import { decodeHtmlEntities, sanitizeHtml } from '@app/html-utils';

// WooCommerce product field accessors.
// These exist because the marketplace product shape uses meta_data/attributes arrays.
// When the marketplace OpenAPI spec types improve, these become typed property access.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WCProduct = any;

const meta = (app: WCProduct, key: string) => app?.meta_data?.find((o: any) => o.key === key)?.value;
const attr = (app: WCProduct, name: string) => app?.attributes?.find((o: any) => o.name === name)?.options;

export const getReverseDomainName = (app: WCProduct): string | undefined => attr(app, 'reverse-domain-name')?.[0];
export const getAppIcon = (app: WCProduct): string | undefined => {
  const url = meta(app, 'app-icon');
  return typeof url === 'string' ? url.replace('http://', 'https://') : url;
};
export const getAuthor = (app: WCProduct) => decodeHtmlEntities(meta(app, 'port-author-name'));
export const getVersions = (app: WCProduct): string[] | undefined => {
  const v = attr(app, 'versions');
  return v?.sort(new Intl.Collator('en', { numeric: true, sensitivity: 'base' }).compare).reverse();
};
export const getCustomLinks = (app: WCProduct) => {
  const links = meta(app, 'app-custom-link');
  if (!links) return undefined;
  return Array.isArray(links) ? links : [links['1']];
};
export const getDocumentationUrl = (app: WCProduct): string | undefined => meta(app, '_documentation_url') || undefined;
export const getShortDescription = (app: WCProduct) => sanitizeHtml(decodeHtmlEntities(app?.short_description || ''));
export const getDescription = (app: WCProduct) => sanitizeHtml(decodeHtmlEntities(app?.description || ''));
export const isBlacklisted = (systemInfo: any, blacklist: string[] | undefined) =>
  blacklist?.includes(systemInfo?.platform) ?? false;
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
