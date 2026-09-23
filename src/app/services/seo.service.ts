import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SITE_URL } from '../config/contact';

export interface SeoConfig {
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  robots?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  imageAlt?: string;
  /** Open Graph `article:tag` entries; cleaned up automatically when omitted. */
  tags?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  updateMetaTags(config: SeoConfig): void {
    // Canonical URLs must be stable per page: drop tracking params & fragments.
    const currentUrl = `${SITE_URL}${this.router.url.split(/[?#]/)[0]}`;
    // Site convention: the naked root keeps its trailing slash, every
    // sub-route uses no trailing slash (matches sitemap.xml, routes.txt
    // and Angular router URLs). Normalize centrally so a stray slash in
    // any caller can never split SEO equity across duplicate canonicals.
    const rawUrl = config.url || currentUrl;
    const targetUrl =
      rawUrl.length > SITE_URL.length + 1 && rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const usingDefaultImage = !config.image;
    const targetImage = config.image || `${SITE_URL}/assets/NatiHero.webp`;
    const targetImageWidth = config.imageWidth ?? (usingDefaultImage ? 853 : undefined);
    const targetImageHeight = config.imageHeight ?? (usingDefaultImage ? 1280 : undefined);
    const targetImageType = config.imageType ?? (usingDefaultImage ? 'image/webp' : undefined);
    const targetImageAlt =
      config.imageAlt ?? (usingDefaultImage ? 'Natalia Ferreira - Psicóloga Clínica' : undefined);

    this.title.setTitle(config.title);

    this.setMeta({ name: 'description' }, config.description);
    this.setMeta({ name: 'keywords' }, config.keywords);
    this.setMeta({ name: 'robots' }, config.robots);

    // Open Graph
    this.updateArticleTags(config.tags);
    this.setMeta({ property: 'og:title' }, config.socialTitle || config.title);
    this.setMeta({ property: 'og:description' }, config.socialDescription || config.description);
    this.setMeta({ property: 'og:url' }, targetUrl);
    this.setMeta({ property: 'og:image' }, targetImage);
    this.setMeta({ property: 'og:image:width' }, targetImageWidth?.toString());
    this.setMeta({ property: 'og:image:height' }, targetImageHeight?.toString());
    this.setMeta({ property: 'og:image:type' }, targetImageType);
    this.setMeta({ property: 'og:image:alt' }, targetImageAlt);
    this.setMeta({ property: 'og:type' }, config.type || 'website');
    this.setMeta({ property: 'article:published_time' }, config.publishedTime);
    this.setMeta({ property: 'article:author' }, config.author);

    // Twitter
    this.setMeta({ name: 'twitter:card' }, 'summary_large_image');
    this.setMeta({ name: 'twitter:url' }, targetUrl);
    this.setMeta({ name: 'twitter:title' }, config.socialTitle || config.title);
    this.setMeta({ name: 'twitter:description' }, config.socialDescription || config.description);
    this.setMeta({ name: 'twitter:image' }, targetImage);
    this.setMeta({ name: 'twitter:image:alt' }, targetImageAlt);

    // Update canonical link (SSR + browser)
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', targetUrl);
  }

  private setMeta(
    selector: { name?: string; property?: string },
    content: string | undefined,
  ): void {
    const attribute = selector.name ? `name="${selector.name}"` : `property="${selector.property}"`;
    if (content === undefined) {
      this.meta.getTag(attribute) && this.meta.removeTag(attribute);
      return;
    }
    this.meta.updateTag({ ...selector, content });
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
    tags?.forEach((tag) => this.meta.addTag({ property: 'article:tag', content: tag }));
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
    script.text = JSON.stringify(schema).replace(/</g, '\\u003c');
  }

  removeStructuredData(id: string): void {
    const scriptId = `json-ld-${id}`;
    const script = this.document.getElementById(scriptId);
    if (script) {
      script.remove();
    }
  }
}
