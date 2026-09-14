import { TestBed } from '@angular/core/testing';
import { makeStateKey, TransferState } from '@angular/core';
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

  it('shares one in-flight index request across list and category consumers', () => {
    let list: BlogPost[] = [];
    let categories: string[] = [];
    service.getPostsList().subscribe(posts => { list = posts; });
    service.getAllCategories().subscribe(values => { categories = values; });

    const requests = httpMock.match('/assets/content/blog/index.json');
    expect(requests).toHaveLength(1);
    requests[0].flush([{
      slug: 'hello', title: 'Hello', date: new Date('2025-01-01').toISOString(),
      description: 'd', image: null, categories: ['Test'], tags: [], categoryDetails: [], author: null,
    }]);

    expect(list).toHaveLength(1);
    expect(categories).toEqual(['Test']);
  });

  it('logs one sanitized record and maps server failures without exposing the response body', () => {
    const log = vi.spyOn(console, 'error');
    let error: BlogServiceError | undefined;
    service.getPostsList().subscribe({ error: value => { error = value; } });

    httpMock.expectOne('/assets/content/blog/index.json').flush({ secret: 'do-not-log' }, {
      status: 500,
      statusText: 'Server Error',
    });

    expect(error?.kind).toBe('server');
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(log.mock.calls.at(-1))).not.toContain('do-not-log');
    log.mockRestore();
  });

  it('allows a failed index request to be retried without sharing the failed request', () => {
    let firstError: BlogServiceError | undefined;
    service.getPostsList().subscribe({ error: value => { firstError = value; } });
    httpMock.expectOne('/assets/content/blog/index.json').error(new ProgressEvent('offline'));
    expect(firstError?.kind).toBe('offline');

    let secondResult: BlogPost[] = [];
    service.getPostsList().subscribe(posts => { secondResult = posts; });
    const retry = httpMock.expectOne('/assets/content/blog/index.json');
    retry.flush([]);
    expect(secondResult).toEqual([]);
  });
});
