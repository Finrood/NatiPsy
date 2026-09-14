import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const readTemplate = async (relativePath) => readFile(resolve(process.cwd(), relativePath), 'utf8');

const [hero, services] = await Promise.all([
  readTemplate('src/app/components/hero/hero.component.html'),
  readTemplate('src/app/components/services/services.component.html'),
]);

const presentationStart = hero.indexOf('<!-- Presentation -->');
const portraitStart = hero.indexOf('<!-- Portrait -->');
assert.ok(
  presentationStart >= 0 && portraitStart > presentationStart,
  'hero source order must present the proposition before the portrait',
);
assert.match(
  hero,
  /order-1[^"]*lg:order-2/,
  'hero copy must lead on mobile and stay on the right at desktop',
);
assert.match(
  hero,
  /order-2[^"]*lg:order-1/,
  'hero portrait must follow the copy on mobile and stay on the left at desktop',
);
assert.match(
  hero,
  /text-3xl sm:text-4xl md:text-5xl lg:text-6xl/,
  'hero heading must use a tighter mobile-first type scale',
);
assert.match(
  hero,
  /motion-safe:hover:scale-105/,
  'hero CTA motion must respect reduced-motion preference',
);
assert.equal(
  (hero.match(/\[href\]="whatsappLink"/g) ?? []).length,
  1,
  'hero must keep one primary appointment CTA',
);

const serviceCtas = services.match(/\[href\]="whatsappLink"/g) ?? [];
assert.equal(
  serviceCtas.length,
  1,
  'services must consolidate repeated WhatsApp actions into one CTA',
);
assert.ok(
  services.indexOf('[href]="whatsappLink"') > services.indexOf('</ul>'),
  'services CTA must follow the service choices',
);
assert.doesNotMatch(
  services,
  /Vamos conversar/,
  'services must not repeat the former generic card CTA',
);
assert.match(
  services,
  /aria-label="Agende sua consulta sobre os serviços"/,
  'services CTA must describe its section context',
);

console.log('Mobile home conversion contract passed.');
