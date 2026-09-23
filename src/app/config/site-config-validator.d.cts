export interface ValidatedSiteConfig {
  readonly canonicalOrigin: string;
  readonly locale: string;
  readonly timeZone: string;
  readonly brandName: string;
  readonly professionalName: string;
  readonly credential: string;
  readonly siteDescription: string;
  readonly specialization: string;
  readonly defaultImage: string;
  readonly email: string;
  readonly whatsappNumber: string;
  readonly instagramUrl: string;
  readonly whatsappUrl: string;
}

export const REQUIRED_KEYS: readonly string[];
export function deriveAllowedHosts(canonicalOrigin: string): readonly string[];
export function validateSiteConfig(input: unknown): ValidatedSiteConfig;
