import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { provideRouter, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { SITE_URL } from '../config/contact';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update title and meta tags', () => {
    service.updateMetaTags({
      title: 'Test Title',
      description: 'Test Description',
      keywords: 'test, keywords',
      url: 'https://psicologanataliaferreira.com/test'
    });

    expect(titleService.getTitle()).toBe('Test Title');
    expect(metaService.getTag('name="description"')?.content).toBe('Test Description');
    expect(metaService.getTag('name="keywords"')?.content).toBe('test, keywords');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Test Title');
    expect(metaService.getTag('property="og:description"')?.content).toBe('Test Description');
    expect(metaService.getTag('property="og:url"')?.content).toBe('https://psicologanataliaferreira.com/test');
  });

  it('should generate stable canonical URLs without query strings or fragments', () => {
    const router = TestBed.inject(Router);
    // Simulate any tracked/query-string URL without depending on real routes.
    Object.defineProperty(router, 'url', { value: '/blog?fbclid=IwARabc123&utm_source=instagram', configurable: true });

    service.updateMetaTags({ title: 'Blog | Psicóloga Natalia Ferreira', description: 'Artigos sobre saúde mental.' });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/blog`);

    // Fragments are stripped too.
    Object.defineProperty(router, 'url', { value: '/blog/carreira-mulheres-negras-fadiga-racial#comentarios', configurable: true });
    service.updateMetaTags({ title: 'Post', description: 'd' });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe(`${SITE_URL}/blog/carreira-mulheres-negras-fadiga-racial`);

    // Explicitly provided URLs are normalized to the site convention:
    // sub-routes lose the trailing slash, the naked root keeps it.
    service.updateMetaTags({ title: 'Blog', description: 'd', url: `${SITE_URL}/blog/` });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/blog`);
    expect(metaService.getTag('property="og:url"')?.content).toBe(`${SITE_URL}/blog`);

    service.updateMetaTags({ title: 'Home', description: 'd', url: `${SITE_URL}/` });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/`);
  });

  it('should manage article:tag Open Graph entries without leaking stale ones', () => {
    service.updateMetaTags({
      title: 'Post A',
      description: 'd',
      tags: ['Ansiedade', 'Carreira']
    });
    const tags = () => Array.from(document.querySelectorAll<HTMLMetaElement>('meta[property="article:tag"]'));
    expect(tags().map(t => t.content)).toEqual(['Ansiedade', 'Carreira']);

    // Without tags, previously set entries are removed.
    service.updateMetaTags({ title: 'Home', description: 'd' });
    expect(tags().length).toBe(0);

    // And they can be replaced by a new set in a single call.
    service.updateMetaTags({ title: 'Post B', description: 'd', tags: ['Relacionamentos'] });
    expect(tags().map(t => t.content)).toEqual(['Relacionamentos']);
  });

  it('should remove robots tag cleanup when config omits it', () => {
    metaService.addTag({ name: 'robots', content: 'noindex' });
    expect(metaService.getTag('name="robots"')).toBeTruthy();

    service.updateMetaTags({ title: 'Clean', description: 'd' });
    expect(metaService.getTag('name="robots"')).toBeNull();
  });

  it('should manage structured data script elements', () => {
    service.setStructuredData('test-schema', { '@type': 'Person', name: 'Natalia' });
    const script = document.getElementById('json-ld-test-schema') as HTMLScriptElement;
    expect(script).toBeTruthy();
    expect(JSON.parse(script.text).name).toBe('Natalia');

    service.removeStructuredData('test-schema');
    expect(document.getElementById('json-ld-test-schema')).toBeNull();
  });
});
