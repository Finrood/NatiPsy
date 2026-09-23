import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { BlogService, BlogServiceError } from './blog.service';
import { BlogPost } from '../models/blog-post.model';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
      author: null,
    };

    let result: BlogPost | null | undefined;
    service.getPostBySlug('hello').subscribe((post) => (result = post));

    httpMock.expectOne('/assets/content/blog/index.json').flush([indexEntry]);
    httpMock.expectOne('/assets/content/blog/posts/hello.json').flush({
      ...indexEntry,
      readTime: 2,
      content: '<p>Hello</p>',
    });

    expect(result?.content).toBe('<p>Hello</p>');
    expect(result?.readTime).toBe(2);
    expect(result?.date instanceof Date).toBe(true);
  });

  it('shares one in-flight index GET across article and related navigation work', () => {
    let posts: BlogPost[] | undefined;
    let categories: string[] | undefined;
    service.getPostsList().subscribe((value) => (posts = value));
    service.getAllCategories().subscribe((value) => (categories = value));

    const requests = httpMock.match('/assets/content/blog/index.json');
    expect(requests).toHaveLength(1);
    requests[0].flush([
      {
        slug: 'hello',
        title: 'Hello',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['Test'],
        author: null,
      },
    ]);

    expect(posts?.[0].slug).toBe('hello');
    expect(categories).toEqual(['Test']);
  });

  it('does not expose the mutable cache through sorted results', () => {
    const index = [
      {
        slug: 'zeta',
        title: 'Zeta',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A'],
        author: null,
      },
      {
        slug: 'alpha',
        title: 'Alpha',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A'],
        author: null,
      },
    ];
    let firstResult: BlogPost[] = [];
    service.getPostsList().subscribe((posts) => {
      firstResult = posts;
    });
    httpMock.expectOne('/assets/content/blog/index.json').flush(index);

    firstResult[0].title = 'mutated';
    firstResult[0].categories.push('subscriber mutation');
    firstResult[0].date.setFullYear(2030);

    let secondResult: BlogPost[] = [];
    service.getPostsList().subscribe((posts) => {
      secondResult = posts;
    });
    expect(secondResult.map((post) => post.slug)).toEqual(['alpha', 'zeta']);
    expect(secondResult[0].title).toBe('Alpha');
    expect(secondResult[0].categories).toEqual(['A']);
    expect(secondResult[0].date.getTime()).toBe(new Date('2025-01-01').getTime());
  });

  it('logs one sanitized record and maps server failures without exposing the response body', () => {
    const log = vi.spyOn(console, 'error');
    let error: BlogServiceError | undefined;
    service.getPostsList().subscribe({
      error: (value) => {
        error = value;
      },
    });

    httpMock.expectOne('/assets/content/blog/index.json').flush(
      { secret: 'do-not-log' },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(error?.kind).toBe('server');
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(log.mock.calls.at(-1))).not.toContain('do-not-log');
    log.mockRestore();
  });

  it('allows a failed index request to be retried without sharing the failed request', () => {
    let firstError: BlogServiceError | undefined;
    service.getPostsList().subscribe({
      error: (value) => {
        firstError = value;
      },
    });
    httpMock.expectOne('/assets/content/blog/index.json').error(new ProgressEvent('offline'));
    expect(firstError?.kind).toBe('offline');

    let secondResult: BlogPost[] = [];
    service.getPostsList().subscribe((posts) => {
      secondResult = posts;
    });
    const retry = httpMock.expectOne('/assets/content/blog/index.json');
    retry.flush([]);
    expect(secondResult).toEqual([]);
  });

  it('does not expose mutable dates through related-post results', () => {
    const index = [
      {
        slug: 'current',
        title: 'Current',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A'],
        author: null,
      },
      {
        slug: 'related',
        title: 'Related',
        date: new Date('2025-02-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A'],
        author: null,
      },
    ];

    let firstResult: BlogPost[] = [];
    service.getRelatedPosts('current', ['A']).subscribe((posts) => {
      firstResult = posts;
    });
    httpMock.expectOne('/assets/content/blog/index.json').flush(index);
    firstResult[0].date.setFullYear(2030);

    let secondResult: BlogPost[] = [];
    service.getRelatedPosts('current', ['A']).subscribe((posts) => {
      secondResult = posts;
    });
    expect(secondResult[0].date.getTime()).toBe(new Date('2025-02-01').getTime());
  });

  it('ranks related posts by shared categories, date, then slug', () => {
    const index = [
      {
        slug: 'current',
        title: 'Current',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A', 'B'],
        author: null,
      },
      {
        slug: 'one-shared',
        title: 'One',
        date: new Date('2025-03-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A'],
        author: null,
      },
      {
        slug: 'two-shared-old',
        title: 'Two',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A', 'B'],
        author: null,
      },
      {
        slug: 'two-shared-new',
        title: 'Three',
        date: new Date('2025-02-01').toISOString(),
        description: 'd',
        image: null,
        categories: ['A', 'B'],
        author: null,
      },
    ];
    let related: BlogPost[] = [];
    service.getRelatedPosts('current', ['A', 'B'], 3).subscribe((posts) => {
      related = posts;
    });
    httpMock.expectOne('/assets/content/blog/index.json').flush(index);

    expect(related.map((post) => post.slug)).toEqual([
      'two-shared-new',
      'two-shared-old',
      'one-shared',
    ]);
  });
});
