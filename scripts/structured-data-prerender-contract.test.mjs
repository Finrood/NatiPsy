import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('dist/nati-psy/browser/index.html', 'utf8');
const match = html.match(
  /<script id="json-ld-homepage-entities" type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
assert.ok(match, 'the prerendered home page must contain the homepage JSON-LD graph');

const graph = JSON.parse(match[1]);
assert.equal(graph['@context'], 'https://schema.org');
assert.ok(Array.isArray(graph['@graph']));
assert.deepEqual(
  graph['@graph'].map((entity) => entity['@type']),
  ['WebSite', 'WebPage', 'Person', 'Service'],
);

const byType = Object.fromEntries(graph['@graph'].map((entity) => [entity['@type'], entity]));
assert.equal(byType.WebSite['@id'], 'https://psicologanataliaferreira.com/#website');
assert.equal(byType.WebPage.mainEntity['@id'], 'https://psicologanataliaferreira.com/#person');
assert.equal(byType.WebPage.about['@id'], 'https://psicologanataliaferreira.com/#service');
assert.equal(byType.Service.provider['@id'], 'https://psicologanataliaferreira.com/#person');
assert.ok(!('serviceUrl' in byType.Service), 'Service must not own serviceUrl');

for (const entity of Object.values(byType)) {
  assert.ok(!('address' in entity), `${entity['@type']} must not invent a physical address`);
  assert.ok(!('geo' in entity), `${entity['@type']} must not invent geolocation`);
  assert.ok(!('hasCredential' in entity), `${entity['@type']} must not invent credentials`);
  if ('serviceUrl' in entity) {
    assert.equal(
      entity['@type'],
      'ServiceChannel',
      'serviceUrl is only valid on a ServiceChannel node',
    );
  }
}

console.log('Prerendered homepage structured-data contract passed.');
