import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogPostComponent } from './blog-post.component';
import { SeoService } from '../../services/seo.service';
import { BlogService } from '../../services/blog.service';
import { ReplaySubject, of, timer } from 'rxjs';
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
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should strip scripts and event handlers from rendered html', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const trusted = component.toSafeHtml(dirty) as { changingThisBreaksApplicationSecurity: string };
    const html = trusted?.changingThisBreaksApplicationSecurity ?? String(trusted);

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<p>Hello</p>');
  });

  it('serializes structured data safely when content contains a closing script marker', () => {
    const seo = TestBed.inject(SeoService);
    seo.setStructuredData('blog-post', { headline: '</script><script>alert(1)</script>' });

    const script = document.getElementById('json-ld-blog-post') as HTMLScriptElement;
    expect(script.text).not.toContain('</script>');
    expect(JSON.parse(script.text).headline).toContain('</script>');
  });
});

describe('BlogPostComponent reused route state', () => {
  it('renders only the latest post and related posts after rapid slug navigation', fakeAsync(() => {
    const params$ = new ReplaySubject<ReturnType<typeof convertToParamMap>>(1);
    const post = (slug: string) => ({ slug, title: slug, date: new Date('2025-01-01'), description: 'd', image: null, categories: ['c'], content: '<p>content</p>', readTime: 1 });
    const blogService = {
      getPostBySlug: (slug: string) => slug === 'a'
        ? timer(50).pipe(map(() => post('a')))
        : of(post('b')),
      getRelatedPosts: (slug: string) => of([post(`${slug}-related`)]),
    };
    params$.next(convertToParamMap({ slug: 'a' }));

    TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params$.asObservable() } },
        { provide: BlogService, useValue: blogService },
      ],
    });

    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();
    params$.next(convertToParamMap({ slug: 'b' }));
    tick();

    expect(fixture.componentInstance.post?.slug).toBe('b');
    expect(fixture.componentInstance.relatedPosts[0]?.slug).toBe('b-related');
    tick(50);
    expect(fixture.componentInstance.post?.slug).toBe('b');
    expect(document.querySelectorAll('#json-ld-blog-post')).toHaveLength(1);
  }));
});
