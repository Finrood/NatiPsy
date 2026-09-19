import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  PLATFORM_ID,
  SecurityContext,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import {
  BlogPost,
  blogAbsoluteImageUrl,
  blogDateOnly,
  blogImageUrl,
  formatBlogDate,
} from '../../models/blog-post.model';
import {
  CommonModule,
  NgOptimizedImage,
  isPlatformBrowser,
} from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { SeoService } from '../../services/seo.service';
import { Observable, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { SITE_URL } from '../../config/contact';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './blog-post.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./blog-post.component.css'],
})
export class BlogPostComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seoService = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  loading = true;
  error: string | null = null;
  safeContent: SafeHtml | string | null = null;

  private readonly destroy$ = new Subject<void>();
  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        distinctUntilChanged(),
        tap(() => {
          this.loading = true;
          this.error = null;
          this.seoService.removeStructuredData('blog-post');
          this.post = null;
          this.safeContent = null;
          this.relatedPosts = [];
          this.cdr.markForCheck();
        }),
        switchMap((slug) =>
          slug
            ? this.loadPostState(slug)
            : of({
                post: null,
                relatedPosts: [],
                error: 'Post slug not found in URL.',
              }),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((state) => {
        this.loading = false;
        this.post = state.post;
        this.relatedPosts = state.relatedPosts;
        this.error = state.error;
        this.safeContent = state.post
          ? this.toSafeHtml(state.post.content as string)
          : null;

        if (state.post) {
          this.updateMetaAndStructuredData(state.post);
        } else {
          this.handleErrorState(state.error || 'Post não encontrado.');
        }
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.post) {
      this.seoService.removeStructuredData('blog-post');
    }
    this.seoService.removeStructuredData('blog-post');
  }

  private loadPostState(
    slug: string,
  ): Observable<{
    post: BlogPost | null;
    relatedPosts: BlogPost[];
    error: string | null;
  }> {
    return this.blogService.getPostBySlug(slug).pipe(
      switchMap((post) =>
        post
          ? this.blogService.getRelatedPosts(slug, post.categories, 3).pipe(
              map((relatedPosts) => ({ post, relatedPosts })),
              catchError(() => of({ post, relatedPosts: [] })),
            )
          : of({ post: null, relatedPosts: [], error: 'Post não encontrado.' }),
      ),
      map((state) => ('error' in state ? state : { ...state, error: null })),
      catchError((error) =>
        of({
          post: null,
          relatedPosts: [],
          error:
            error instanceof Error ? error.message : 'Erro ao carregar o post.',
        }),
      ),
    );
  }

  /**
   * Sanitize rendered Markdown HTML before binding it to the view.
   * `marked` passes raw HTML straight through, so its output must be
   * cleaned before bypassing Angular's built-in sanitizer. DOMPurify needs
   * a DOM and therefore only runs in the browser; on the server (SSR /
   * prerender) Angular's default HTML sanitizer is applied instead, which
   * requires no bypass.
   */
  toSafeHtml(html: string): SafeHtml | string {
    if (this.isBrowser) {
      return this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(html));
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  handleErrorState(errorMessage: string): void {
    this.error = errorMessage;
    this.post = null;
    this.safeContent = null;
    this.loading = false;
    this.seoService.updateMetaTags({
      title: 'Erro | Psicóloga Natalia Ferreira',
      description: 'Página não encontrada ou erro ao carregar o artigo.',
      url: `${SITE_URL}/404`,
      robots: 'noindex',
    });
    this.cdr.detectChanges();
  }

  updateMetaAndStructuredData(post: BlogPost): void {
    const imageUrl = blogAbsoluteImageUrl(post.image);

    this.seoService.updateMetaTags({
      title: `${post.title} | Blog Natália Ferreira`,
      description: post.description,
      keywords:
        post.categories.join(', ') + ', psicologia, terapia, natalia ferreira',
      image: imageUrl,
      imageWidth: post.imageWidth,
      imageHeight: post.imageHeight,
      imageType: post.image ? 'image/webp' : undefined,
      imageAlt: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date ? post.date.toISOString() : undefined,
      author: post.author?.name || 'Natalia Ferreira',
      tags: post.categories,
    });

    const blogPosting = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      name: post.title,
      description: post.description,
      image: imageUrl,
      datePublished: post.date.toISOString(),
      author: {
        '@type': 'Person',
        name: post.author?.name || 'Natalia Ferreira',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Person',
        name: 'Natalia Ferreira Psicóloga',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/logo.png`,
        },
      },
      url: `${SITE_URL}/blog/${post.slug}`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
      keywords: post.categories.join(', '),
    };
    this.seoService.setStructuredData('blog-post', {
      '@context': 'https://schema.org',
      '@graph': [
        blogPosting,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Início',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: `${SITE_URL}/blog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: `${SITE_URL}/blog/${post.slug}`,
            },
          ],
        },
      ],
    });
  }
}
