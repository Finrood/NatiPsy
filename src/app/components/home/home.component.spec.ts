import { homepageStructuredData } from './home.component';

describe('homepage structured data', () => {
  it('uses linked entities without inventing location or credential types', () => {
    const graph = homepageStructuredData()['@graph'];
    const service = graph.find((entity) => entity['@type'] === 'Service')! as any;
    const person = graph.find((entity) => entity['@type'] === 'Person')! as any;

    expect(graph.map((entity) => entity['@id'])).toEqual([
      'https://psicologanataliaferreira.com/#website',
      'https://psicologanataliaferreira.com/#webpage',
      'https://psicologanataliaferreira.com/#person',
      'https://psicologanataliaferreira.com/#service',
    ]);
    expect(service).not.toHaveProperty('address');
    expect(service).not.toHaveProperty('geo');
    expect(person).not.toHaveProperty('hasCredential');
    expect(service).not.toHaveProperty('serviceUrl');
    expect(service).not.toHaveProperty('availableChannel');
    expect(service).not.toHaveProperty('serviceLocation');
  });
});
