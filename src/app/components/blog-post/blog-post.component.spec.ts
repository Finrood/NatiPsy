import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogPostComponent } from './blog-post.component';
import { buildBlogPageTitle } from './blog-post.component';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_URL } from '../../config/contact';

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

  it('budgets the final title and keeps dedicated SEO titles suffix-free', () => {
    const dedicated = buildBlogPageTitle('Editorial title', 'Concise discovery title');
    const fallback = buildBlogPageTitle('A very long editorial title that would otherwise exceed the complete search title budget by a wide margin');
    const alreadySuffixed = buildBlogPageTitle('Short | Blog Natália Ferreira');

    expect(dedicated).toBe('Concise discovery title');
    expect(dedicated).not.toContain('Blog Natália Ferreira');
    expect(fallback.length).toBeLessThanOrEqual(60);
    expect(fallback.endsWith(' | Blog Natália Ferreira')).toBe(true);
    expect(alreadySuffixed.match(/Blog Natália Ferreira/g)).toHaveLength(1);
  });

  it('writes final title, canonical, Open Graph, and Twitter values', () => {
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
