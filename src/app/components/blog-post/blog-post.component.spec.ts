import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogPostComponent, buildBlogPageTitle } from './blog-post.component';
import { SeoService } from '../../services/seo.service';
import { BlogService } from '../../services/blog.service';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_URL } from '../../config/contact';
import { ReplaySubject, of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';

describe('BlogPostComponent', () => {
  let component: BlogPostComponent;
  let fixture: ComponentFixture<BlogPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should strip scripts and event handlers from rendered html', () => {
    const dirty =
      '<p>Hello</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const trusted = component.toSafeHtml(dirty) as {
      changingThisBreaksApplicationSecurity: string;
    };
    const html =
      trusted?.changingThisBreaksApplicationSecurity ?? String(trusted);

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<p>Hello</p>');
  });

  it('serializes structured data safely when content contains a closing script marker', () => {
    const seo = TestBed.inject(SeoService);
    seo.setStructuredData('blog-post', {
      headline: '</script><script>alert(1)</script>',
    });

    const script = document.getElementById(
      'json-ld-blog-post',
    ) as HTMLScriptElement;
    expect(script.text).not.toContain('</script>');
    expect(JSON.parse(script.text).headline).toContain('</script>');
  });

  it('uses dedicated SEO titles and social metadata without regressing the H1 title', () => {
    expect(buildBlogPageTitle('Editorial title', 'Concise discovery title')).toBe('Concise discovery title');
    expect(buildBlogPageTitle('Short | Blog Natália Ferreira').match(/Blog Natália Ferreira/g)).toHaveLength(1);

    component.updateMetaAndStructuredData({
      slug: 'article',
      title: 'Editorial title',
      seoTitle: 'Concise discovery title',
      seoDescription: 'Concise description',
      socialTitle: 'Social title',
      socialDescription: 'Social description',
      date: new Date('2025-01-01'),
      description: 'Editorial description',
      image: null,
      categories: ['Carreira'],
      content: '<p>content</p>',
      readTime: 1,
    });

    expect(TestBed.inject(Title).getTitle()).toBe('Concise discovery title');
    expect(TestBed.inject(Meta).getTag('property="og:title"')?.content).toBe('Social title');
    expect(TestBed.inject(Meta).getTag('name="twitter:title"')?.content).toBe('Social title');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/blog/article`);
  });
});

describe('BlogPostComponent reused route state', () => {
  const post = (slug: string) => ({
    slug,
    title: slug,
    date: new Date('2025-01-01'),
    description: 'd',
    image: null,
    categories: ['c'],
    content: '<p>content</p>',
    readTime: 1,
  });

  it('renders a directly loaded article and its related posts', () => {
    const params$ = new ReplaySubject<ReturnType<typeof convertToParamMap>>(1);
    params$.next(convertToParamMap({ slug: 'a' }));
    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params$.asObservable() },
        },
        {
          provide: BlogService,
          useValue: {
            getPostBySlug: () => of(post('a')),
            getRelatedPosts: () => of([post('a-related')]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.post?.slug).toBe('a');
    expect(fixture.componentInstance.relatedPosts[0]?.slug).toBe('a-related');
  });

  it('renders only the latest post after delayed A-to-fast-B navigation', async () => {
    vi.useFakeTimers();
    const params$ = new ReplaySubject<ReturnType<typeof convertToParamMap>>(1);
    const blogService = {
      getPostBySlug: (slug: string) =>
        slug === 'a' ? timer(50).pipe(map(() => post('a'))) : of(post('b')),
      getRelatedPosts: (slug: string) => of([post(`${slug}-related`)]),
    };
    params$.next(convertToParamMap({ slug: 'a' }));

    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params$.asObservable() },
        },
        { provide: BlogService, useValue: blogService },
      ],
    });

    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();
    params$.next(convertToParamMap({ slug: 'b' }));
    await vi.advanceTimersByTimeAsync(0);

    expect(fixture.componentInstance.post?.slug).toBe('b');
    expect(fixture.componentInstance.relatedPosts[0]?.slug).toBe('b-related');
    await vi.advanceTimersByTimeAsync(50);
    expect(fixture.componentInstance.post?.slug).toBe('b');
    expect(document.querySelectorAll('#json-ld-blog-post')).toHaveLength(1);
    fixture.destroy();
    vi.useRealTimers();
  });

  it('removes article schema when navigating from B back to the blog route', () => {
    const params$ = new ReplaySubject<ReturnType<typeof convertToParamMap>>(1);
    params$.next(convertToParamMap({ slug: 'b' }));
    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params$.asObservable() },
        },
        {
          provide: BlogService,
          useValue: {
            getPostBySlug: () => of(post('b')),
            getRelatedPosts: () => of([]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();
    expect(document.querySelectorAll('#json-ld-blog-post')).toHaveLength(1);

    params$.next(convertToParamMap({}));
    expect(fixture.componentInstance.post).toBeNull();
    expect(document.querySelectorAll('#json-ld-blog-post')).toHaveLength(0);
  });

  it('keeps the article when related-post loading fails', () => {
    const params$ = new ReplaySubject<ReturnType<typeof convertToParamMap>>(1);
    params$.next(convertToParamMap({ slug: 'b' }));
    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params$.asObservable() },
        },
        {
          provide: BlogService,
          useValue: {
            getPostBySlug: () => of(post('b')),
            getRelatedPosts: () =>
              throwError(() => new Error('related unavailable')),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.post?.slug).toBe('b');
    expect(fixture.componentInstance.relatedPosts).toEqual([]);
    expect(fixture.componentInstance.error).toBeNull();
  });
});
