import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetaTags(config: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
  }) {
    const baseUrl = 'https://psicologanataliaferreira.com';
    const currentUrl = `${baseUrl}${this.router.url}`;

    this.title.setTitle(config.title);
    
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: config.url || currentUrl });
    this.meta.updateTag({ property: 'og:image', content: config.image || `${baseUrl}/assets/NatiHero.webp` });
    
    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image || `${baseUrl}/assets/NatiHero.webp` });
    
    // Only update canonical link if in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const link: HTMLLinkElement = document.querySelector('link[rel="canonical"]') 
        || document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', config.url || currentUrl);
      if (!document.querySelector('link[rel="canonical"]')) {
        document.head.appendChild(link);
      }
    }
  }
} 