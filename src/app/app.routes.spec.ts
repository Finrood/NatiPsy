import { routes } from './app.routes';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { BlogService } from './services/blog.service';

describe('application routes', () => {
  it('keeps the article component out of the initial route module', async () => {
    const blogRoute = routes.find(route => route.path === 'blog');
    const articleRoute = blogRoute?.children?.find(route => route.path === ':slug');

    expect(articleRoute?.component).toBeUndefined();
    expect(articleRoute?.loadComponent).toBeDefined();

    const loadedComponent = await articleRoute!.loadComponent!();
    expect(loadedComponent).toBeTruthy();
  });

  it('navigates through the lazy article route and renders the loaded article', async () => {
    const articleRoute = routes.find((route) => route.path === 'blog')?.children?.find((route) => route.path === ':slug');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'blog/:slug', loadComponent: articleRoute!.loadComponent }]),
        {
          provide: BlogService,
          useValue: {
            getPostBySlug: () => of({
              slug: 'article',
              title: 'Article',
              date: new Date('2025-01-01'),
              description: 'Description',
              image: null,
              categories: ['Carreira'],
              content: '<p>Rendered article</p>',
              readTime: 1,
            }),
            getRelatedPosts: () => of([]),
          },
        },
      ],
    });

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/blog/article', BlogPostComponent);
    expect(component.post?.slug).toBe('article');
    expect(harness.routeNativeElement?.textContent).toContain('Rendered article');
  });
});
