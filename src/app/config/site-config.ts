import rawConfig from './site-config.json';
import {
  deriveAllowedHosts,
  validateSiteConfig,
  type ValidatedSiteConfig,
} from './site-config-validator.cjs';

export type SiteConfig = ValidatedSiteConfig;
export const SITE_CONFIG: SiteConfig = validateSiteConfig(rawConfig);

export const SITE_CONFIG_ALLOWED_HOSTS = deriveAllowedHosts(SITE_CONFIG.canonicalOrigin);
