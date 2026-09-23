const REQUIRED_KEYS = Object.freeze([
  'canonicalOrigin', 'locale', 'timeZone', 'brandName', 'professionalName',
  'credential', 'siteDescription', 'specialization', 'defaultImage', 'email',
  'whatsappNumber', 'instagramUrl',
]);

const SECRET_KEY = /(?:password|secret|token|private.?key|api.?key)/i;

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid site configuration field: ${field}`);
  }
  return value.trim();
}

function exactOrigin(value) {
  let origin;
  try {
    origin = new URL(value);
  } catch {
    throw new Error('canonicalOrigin must be an exact http(s) origin.');
  }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password ||
      origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('canonicalOrigin must be an exact http(s) origin.');
  }
  return origin.origin;
}

function safeRootRelativeImage(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new Error('defaultImage must be a safe root-relative path.');
  }
  const segments = decoded.split('/').slice(1);
  if (decoded !== value || !/^\/assets\/[A-Za-z0-9._/-]+$/.test(decoded) ||
      segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error('defaultImage must be a safe root-relative path.');
  }
  return value;
}

function validateSiteConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Site configuration must be an object.');
  }
  const keys = Object.keys(input);
  const secretKey = keys.find((key) => SECRET_KEY.test(key));
  if (secretKey) throw new Error(`Secret-shaped site configuration key is forbidden: ${secretKey}`);
  const unknown = keys.find((key) => !REQUIRED_KEYS.includes(key));
  if (unknown) throw new Error(`Unknown site configuration field: ${unknown}`);
  const missing = REQUIRED_KEYS.find((key) => !Object.hasOwn(input, key));
  if (missing) throw new Error(`Missing site configuration field: ${missing}`);

  const locale = requiredString(input.locale, 'locale');
  let canonicalLocale;
  try {
    [canonicalLocale] = Intl.getCanonicalLocales(locale);
  } catch {
    throw new Error('locale must be a valid canonical locale.');
  }
  if (canonicalLocale !== locale) throw new Error('locale must be a valid canonical locale.');

  const timeZone = requiredString(input.timeZone, 'timeZone');
  try {
    new Intl.DateTimeFormat(locale, { timeZone }).format();
  } catch {
    throw new Error('timeZone must be a valid IANA time zone.');
  }

  const whatsappNumber = requiredString(input.whatsappNumber, 'whatsappNumber');
  if (!/^\+[1-9]\d{7,14}$/.test(whatsappNumber)) {
    throw new Error('whatsappNumber must be a bounded E.164 number.');
  }

  const email = requiredString(input.email, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('email must be a valid email address.');
  }

  const instagramUrl = requiredString(input.instagramUrl, 'instagramUrl');
  let instagram;
  try {
    instagram = new URL(instagramUrl);
  } catch {
    throw new Error('instagramUrl must be a credential-free HTTPS profile on instagram.com.');
  }
  if (instagram.protocol !== 'https:' || instagram.username || instagram.password ||
      !['instagram.com', 'www.instagram.com'].includes(instagram.hostname.toLowerCase()) ||
      instagram.search || instagram.hash || !/^\/[A-Za-z0-9._]+\/?$/.test(instagram.pathname)) {
    throw new Error('instagramUrl must be a credential-free HTTPS profile on instagram.com.');
  }

  return Object.freeze({
    canonicalOrigin: exactOrigin(requiredString(input.canonicalOrigin, 'canonicalOrigin')),
    locale,
    timeZone,
    brandName: requiredString(input.brandName, 'brandName'),
    professionalName: requiredString(input.professionalName, 'professionalName'),
    credential: requiredString(input.credential, 'credential'),
    siteDescription: requiredString(input.siteDescription, 'siteDescription'),
    specialization: requiredString(input.specialization, 'specialization'),
    defaultImage: safeRootRelativeImage(requiredString(input.defaultImage, 'defaultImage')),
    email,
    whatsappNumber,
    instagramUrl: instagram.toString(),
    whatsappUrl: `https://wa.me/${whatsappNumber.slice(1)}`,
  });
}

function deriveAllowedHosts(canonicalOrigin) {
  const canonicalHost = new URL(canonicalOrigin).hostname.toLowerCase();
  const alternateHost = canonicalHost.startsWith('www.')
    ? canonicalHost.slice(4)
    : `www.${canonicalHost}`;
  return Object.freeze([...new Set(['localhost', '127.0.0.1', '::1', canonicalHost, alternateHost])]);
}

module.exports = { REQUIRED_KEYS, deriveAllowedHosts, validateSiteConfig };
