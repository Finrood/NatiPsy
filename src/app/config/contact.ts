import { SITE_CONFIG } from './site-config';

export const SITE_URL = SITE_CONFIG.canonicalOrigin;
export const PERSON_NAME = SITE_CONFIG.brandName;
export const PROFESSIONAL_NAME = SITE_CONFIG.professionalName;
export const CREDENTIAL = SITE_CONFIG.credential;
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}${SITE_CONFIG.defaultImage}`;

export const WHATSAPP_NUMBER = SITE_CONFIG.whatsappNumber;

export const WHATSAPP_LINK = SITE_CONFIG.whatsappUrl;

export const INSTAGRAM_LINK = SITE_CONFIG.instagramUrl;

export const EMAIL_ADDRESS = SITE_CONFIG.email;

export const EMAIL_LINK = `mailto:${EMAIL_ADDRESS}`;
