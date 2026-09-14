import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogService } from './blog.service';
import { BlogPost } from '../models/blog-post.model';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch pre-rendered post JSON instead of parsing markdown', () => {
    const indexEntry = {
      slug: 'hello',
      title: 'Hello',
      date: new Date('2025-01-01'),
      description: 'd',
      image: null,
      categories: ['Test'],
      author: null
    };

    let result: BlogPost | null | undefined;
    service.getPostBySlug('hello').subscribe(post => (result = post));

    httpMock.expectOne('/assets/content/blog/index.json').flush([indexEntry]);
    httpMock.expectOne('/assets/content/blog/posts/hello.json').flush({
      ...indexEntry,
      readTime: 2,
      content: '<p>Hello</p>'
    });

    expect(result?.content).toBe('<p>Hello</p>');
    expect(result?.readTime).toBe(2);
    expect(result?.date instanceof Date).toBe(true);
  });

  it('shares one in-flight index GET across article and related navigation work', () => {
    let posts: BlogPost[] | undefined;
    let categories: string[] | undefined;
    service.getPostsList().subscribe(value => (posts = value));
    service.getAllCategories().subscribe(value => (categories = value));

    const requests = httpMock.match('/assets/content/blog/index.json');
    expect(requests).toHaveLength(1);
    requests[0].flush([{
      slug: 'hello',
      title: 'Hello',
      date: new Date('2025-01-01').toISOString(),
      description: 'd',
      image: null,
      categories: ['Test'],
      author: null,
    }]);

    expect(posts?.[0].slug).toBe('hello');
    expect(categories).toEqual(['Test']);
  });

  it('allows a failed index load to be retried', () => {
    let firstError: unknown;
    service.getPostsList().subscribe({ error: error => { firstError = error; } });
    httpMock.expectOne('/assets/content/blog/index.json').flush('temporary failure', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    expect(firstError).toBeTruthy();

    let posts: BlogPost[] | undefined;
    service.getPostsList().subscribe(result => { posts = result; });
    httpMock.expectOne('/assets/content/blog/index.json').flush([
      { slug: 'retried', title: 'Retried', date: new Date('2025-01-01').toISOString(), description: 'd', image: null, categories: [], author: null },
    ]);
    expect(posts?.[0].slug).toBe('retried');
  });
});
