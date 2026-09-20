import rawConfig from './site-config.json';

export interface SiteConfig {
  canonicalOrigin: string;
  locale: string;
  timeZone: string;
  brandName: string;
  professionalName: string;
  credential: string;
  siteDescription: string;
  specialization: string;
  defaultImage: string;
  email: string;
  whatsappNumber: string;
  instagramUrl: string;
  whatsappUrl: string;
}

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid site configuration field: ${field}`);
  }
  return value.trim();
};

const exactOrigin = (value: string): string => {
  const origin = new URL(value);
  if (
    !['http:', 'https:'].includes(origin.protocol)
    || origin.username
    || origin.password
    || origin.pathname !== '/'
    || origin.search
    || origin.hash
  ) {
    throw new Error('canonicalOrigin must be an exact http(s) origin.');
  }
  return origin.origin;
};

const canonicalOrigin = exactOrigin(requiredString(rawConfig.canonicalOrigin, 'canonicalOrigin'));
const whatsappNumber = requiredString(rawConfig.whatsappNumber, 'whatsappNumber');
const whatsappDigits = whatsappNumber.replace(/\D/g, '');
if (whatsappDigits.length < 10) {
  throw new Error('whatsappNumber must contain a complete international number.');
}
const email = requiredString(rawConfig.email, 'email');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('email must be a valid email address.');
}
const instagramUrl = requiredString(rawConfig.instagramUrl, 'instagramUrl');
if (new URL(instagramUrl).protocol !== 'https:') {
  throw new Error('instagramUrl must use HTTPS.');
}

export const SITE_CONFIG: SiteConfig = Object.freeze({
  canonicalOrigin,
  locale: requiredString(rawConfig.locale, 'locale'),
  timeZone: requiredString(rawConfig.timeZone, 'timeZone'),
  brandName: requiredString(rawConfig.brandName, 'brandName'),
  professionalName: requiredString(rawConfig.professionalName, 'professionalName'),
  credential: requiredString(rawConfig.credential, 'credential'),
  siteDescription: requiredString(rawConfig.siteDescription, 'siteDescription'),
  specialization: requiredString(rawConfig.specialization, 'specialization'),
  defaultImage: requiredString(rawConfig.defaultImage, 'defaultImage'),
  email,
  whatsappNumber,
  instagramUrl,
  whatsappUrl: `https://wa.me/${whatsappDigits}`,
});

const canonicalHost = new URL(SITE_CONFIG.canonicalOrigin).hostname;
const alternateHost = canonicalHost.startsWith('www.') ? canonicalHost.slice(4) : `www.${canonicalHost}`;
export const SITE_CONFIG_ALLOWED_HOSTS = [...new Set(['localhost', '127.0.0.1', canonicalHost, alternateHost])];
