import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SITE_URL } from '../config/contact';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  robots?: string;
  /** Open Graph `article:tag` entries; cleaned up automatically when omitted. */
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  updateMetaTags(config: SeoConfig): void {
    // Canonical URLs must be stable per page: drop tracking params & fragments.
    const currentUrl = `${SITE_URL}${this.router.url.split(/[?#]/)[0]}`;
    const targetUrl = config.url || currentUrl;
    const targetImage = config.image || `${SITE_URL}/assets/NatiHero.webp`;

    this.title.setTitle(config.title);
    
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    if (config.robots) {
      this.meta.updateTag({ name: 'robots', content: config.robots });
    } else {
      const existingRobots = this.meta.getTag('name="robots"');
      if (existingRobots) {
        this.meta.removeTag('name="robots"');
      }
    }
    
    // Open Graph
    this.updateArticleTags(config.tags);
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: targetUrl });
    this.meta.updateTag({ property: 'og:image', content: targetImage });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: config.publishedTime });
    }
    if (config.author) {
      this.meta.updateTag({ property: 'article:author', content: config.author });
    }
    
    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: targetImage });
    
    // Update canonical link (SSR + browser)
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', targetUrl);
  }

  /**
   * Replaces all existing `article:tag` entries with the given ones, or removes
   * them entirely when omitted — stale tags from a previously visited post must
   * never leak into other pages' OG data.
   */
  private updateArticleTags(tags?: string[]): void {
    while (this.meta.getTag('property="article:tag"')) {
      this.meta.removeTag('property="article:tag"');
    }
    tags?.forEach(tag => this.meta.addTag({ property: 'article:tag', content: tag }));
  }

  setStructuredData(id: string, schema: object | object[]): void {
    const scriptId = `json-ld-${id}`;
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);
  }

  removeStructuredData(id: string): void {
    const scriptId = `json-ld-${id}`;
    const script = this.document.getElementById(scriptId);
    if (script) {
      script.remove();
    }
  }
} 