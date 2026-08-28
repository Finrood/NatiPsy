import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { INSTAGRAM_LINK, SITE_URL, WHATSAPP_LINK, WHATSAPP_NUMBER } from '../../config/contact';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly seoService = inject(SeoService);
  readonly whatsappLink = WHATSAPP_LINK;

  ngOnInit(): void {
    this.seoService.setStructuredData('hero-service', {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Natalia Ferreira - Psicóloga Clínica',
      image: `${SITE_URL}/assets/NatiHero.webp`,
      description: 'Psicóloga Clínica especializada em Terapia Relacional Sistêmica',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Atendimento Online',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-27.5969',
        longitude: '-48.5495',
      },
      url: SITE_URL,
      telephone: WHATSAPP_NUMBER,
      priceRange: '$$',
      sameAs: [INSTAGRAM_LINK],
    });
  }

  ngOnDestroy(): void {
    // Don't leave homepage-only schema on the DOM during SPA navigation.
    this.seoService.removeStructuredData('hero-service');
  }
}
