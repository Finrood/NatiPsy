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
import { of, Subject } from 'rxjs';
import { takeUntil, finalize, catchError, tap } from 'rxjs/operators';
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
  private fragmentObserver: MutationObserver | null = null;
  private readonly onHashChange = () => this.resolveFragment();
  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;

  ngOnInit(): void {
    if (this.isBrowser)
      window.addEventListener('hashchange', this.onHashChange);
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPost(slug);
      } else {
        // Render the 404 state in place: navigating away mid-render makes SSR
        // unstable, and the noindex meta (set by handleErrorState) is mapped
        // to an HTTP 404 status by the server.
        this.handleErrorState('Post slug not found in URL.');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.fragmentObserver?.disconnect();
    if (this.isBrowser)
      window.removeEventListener('hashchange', this.onHashChange);
    if (this.post) {
      this.seoService.removeStructuredData(`blog-post-${this.post.slug}`);
    }
  }

  loadPost(slug: string): void {
    this.loading = true;
    this.error = null;
    this.post = null;
    this.safeContent = null;
    this.relatedPosts = [];
    this.cdr.markForCheck();

    this.blogService
      .getPostBySlug(slug)
      .pipe(
        finalize(() => {
          this.loading = false;
          // NOTE: markForCheck() alone is not enough here: after an async
          // fetch there is no guaranteed change-detection cycle left in this
          // app, so force the view update explicitly. This is still safe on
          // the direct-URL path: transferred data arrives synchronously
          // before first render, making this a harmless no-op there.
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.handleErrorState(err.message || 'Erro ao carregar o post.');
          return of(null);
        }),
        tap((post) => {
          if (post) {
            this.post = post;
            this.safeContent = this.toSafeHtml(post.content as string);
            this.updateMetaAndStructuredData(post);
            // Pass categories so related posts resolve from the (transferred)
            // index without refetching the current post.
            this.loadRelatedPosts(slug, post.categories);
          } else {
            // Keep the URL; show the not-found state and let the noindex
            // robots meta drive an HTTP 404 from the server.
            this.handleErrorState('Post não encontrado.');
          }
          this.cdr.detectChanges();
          // The article and its generated headings exist only after the view
          // has rendered the async post response. Resolve the fragment after
          // that render so direct loads and client navigations share the same
          // deterministic observer path.
          if (post) this.resolveFragment();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private resolveFragment(): void {
    if (!this.isBrowser || !window.location.hash) return;

    this.fragmentObserver?.disconnect();
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const article = document.querySelector('article');
    if (!article) return;

    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      this.fragmentObserver?.disconnect();
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (!target.hasAttribute('tabindex'))
        target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    this.fragmentObserver = new MutationObserver(scrollToTarget);
    this.fragmentObserver.observe(article, { childList: true, subtree: true });
    scrollToTarget();
  }

  loadRelatedPosts(slug: string, categories?: string[]): void {
    this.blogService
      .getRelatedPosts(slug, categories, 3)
      .pipe(takeUntil(this.destroy$))
      .subscribe((posts) => {
        this.relatedPosts = posts;
        this.cdr.detectChanges();
      });
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

    this.seoService.setStructuredData(`blog-post-${post.slug}`, {
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
    });
  }
}
