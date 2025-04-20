import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog-post.model';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import {of, Subject} from 'rxjs';
import { takeUntil, finalize, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
})
export class BlogPostComponent implements OnInit, OnDestroy {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  loading = true;
  error: string | null = null;
  safeContent: SafeHtml | null = null;

  private destroy$ = new Subject<void>();
  private structuredDataScript: HTMLScriptElement | null = null; // To manage the script tag

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private seoService: SeoService,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params.get('slug');
        if (slug) {
          this.loadPost(slug);
        } else {
          this.handleErrorState("Post slug not found in URL.");
          this.router.navigate(['/404']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId) && this.structuredDataScript) {
      this.renderer.removeChild(document.head, this.structuredDataScript);
    }
  }

  loadPost(slug: string): void {
    this.loading = true;
    this.error = null;
    this.post = null;
    this.safeContent = null;
    this.relatedPosts = [];

    this.blogService.getPostBySlug(slug)
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.handleErrorState(err.message || 'Erro ao carregar o post.');
          if (err.message.includes('Could not load post')) {
            this.router.navigate(['/404'], { skipLocationChange: true });
          }
          return of(null);
        }),
        tap(post => {
          if (post) {
            this.post = post;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content as string);
            this.updateMetaAndStructuredData(post);
            this.loadRelatedPosts(slug);
          } else if (!this.loading) {
            this.handleErrorState('Post não encontrado.');
            this.router.navigate(['/404'], { skipLocationChange: true });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadRelatedPosts(slug: string): void {
    this.blogService.getRelatedPosts(slug, 3)
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.relatedPosts = posts;
      });
  }


  handleErrorState(errorMessage: string): void {
    this.error = errorMessage;
    this.post = null;
    this.safeContent = null;
    this.loading = false;
    this.titleService.setTitle('Erro | Psicóloga Natalia Ferreira');
    this.metaService.updateTag({ name: 'robots', content: 'noindex' });
  }

  updateMetaAndStructuredData(post: BlogPost): void {
    const imageUrl = post.image
      ? `https://psicologanataliaferreira.com/assets/content/blog/images/${post.image}`
      : 'https://psicologanataliaferreira.com/assets/NatiHero.webp';

    this.seoService.updateMetaTags({
      title: `${post.title} | Blog Natália Ferreira`,
      description: post.description,
      keywords: post.categories.join(', ') + ', psicologia, terapia, natalia ferreira',
      image: imageUrl,
      url: `https://psicologanataliaferreira.com/blog/${post.slug}`
    });

    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    if (post.date) {
      this.metaService.updateTag({ property: 'article:published_time', content: post.date.toISOString() });
    }
    if (post.author?.name) {
      this.metaService.updateTag({ property: 'article:author', content: post.author.name }); // Or link to author page if available
    }
    post.categories.forEach(category => {
      this.metaService.addTag({ property: 'article:tag', content: category });
    });


    if (isPlatformBrowser(this.platformId)) {
      if (this.structuredDataScript) {
        this.renderer.removeChild(document.head, this.structuredDataScript);
        this.structuredDataScript = null;
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "name": post.title,
        "description": post.description,
        "image": imageUrl,
        "datePublished": post.date.toISOString(),
        "author": {
          "@type": "Person",
          "name": post.author?.name || "Natalia Ferreira",
          "url": post.author?.name ? undefined : "https://psicologanataliaferreira.com" // Optional author URL
        },
        "publisher": {
          "@type": "Person",
          "name": "Natalia Ferreira Psicóloga",
          "logo": {
            "@type": "ImageObject",
            "url": "https://psicologanataliaferreira.com/assets/logo.png" // Your site logo
          }
        },
        "url": `https://psicologanataliaferreira.com/blog/${post.slug}`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://psicologanataliaferreira.com/blog/${post.slug}`
        },
        "keywords": post.categories.join(', ')
      };

      this.structuredDataScript = this.renderer.createElement('script');
      this.structuredDataScript!.type = 'application/ld+json';
      this.structuredDataScript!.text = JSON.stringify(schema);
      this.renderer.appendChild(document.head, this.structuredDataScript);
    }
  }
}
