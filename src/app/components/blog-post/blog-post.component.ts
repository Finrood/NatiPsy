import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost, blogAbsoluteImageUrl, blogImageUrl } from '../../models/blog-post.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import { of, Subject } from 'rxjs';
import { takeUntil, finalize, catchError, tap } from 'rxjs/operators';
import { SITE_URL } from '../../config/contact';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage
  ],
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

  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  loading = true;
  error: string | null = null;
  safeContent: SafeHtml | null = null;

  private readonly destroy$ = new Subject<void>();
  protected readonly imageUrl = blogImageUrl;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
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

    this.blogService.getPostBySlug(slug)
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
        catchError(err => {
          this.handleErrorState(err.message || 'Erro ao carregar o post.');
          return of(null);
        }),
        tap(post => {
          if (post) {
            this.post = post;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content as string);
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
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadRelatedPosts(slug: string, categories?: string[]): void {
    this.blogService.getRelatedPosts(slug, categories, 3)
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.relatedPosts = posts;
        this.cdr.detectChanges();
      });
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
      robots: 'noindex'
    });
    this.cdr.detectChanges();
  }

  updateMetaAndStructuredData(post: BlogPost): void {
    const imageUrl = blogAbsoluteImageUrl(post.image);

    this.seoService.updateMetaTags({
      title: `${post.title} | Blog Natália Ferreira`,
      description: post.description,
      keywords: post.categories.join(', ') + ', psicologia, terapia, natalia ferreira',
      image: imageUrl,
      url: `${SITE_URL}/blog/${post.slug}/`,
      type: 'article',
      publishedTime: post.date ? post.date.toISOString() : undefined,
      author: post.author?.name || 'Natalia Ferreira',
      tags: post.categories
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
        url: SITE_URL
      },
      publisher: {
        '@type': 'Person',
        name: 'Natalia Ferreira Psicóloga',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/logo.png`
        }
      },
      url: `${SITE_URL}/blog/${post.slug}`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`
      },
      keywords: post.categories.join(', ')
    });
  }
}
