import siteConfig from './site-config.json';

export const SITE_URL = siteConfig.canonicalOrigin;
export const PERSON_NAME = siteConfig.brandName;
export const PROFESSIONAL_NAME = siteConfig.professionalName;
export const CREDENTIAL = siteConfig.credential;
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}${siteConfig.defaultImage}`;

export const WHATSAPP_NUMBER = siteConfig.whatsappNumber;

export const WHATSAPP_LINK = siteConfig.whatsappUrl;

export const INSTAGRAM_LINK = siteConfig.instagramUrl;

export const EMAIL_ADDRESS = siteConfig.email;

export const EMAIL_LINK = `mailto:${EMAIL_ADDRESS}`;
