import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SITE_URL, WHATSAPP_LINK, WHATSAPP_NUMBER } from '../../config/contact';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about-me',
  imports: [NgOptimizedImage],
  templateUrl: './about-me.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeComponent implements OnInit, OnDestroy {
  private readonly seoService = inject(SeoService);
  readonly whatsappLink = WHATSAPP_LINK;

  ngOnInit(): void {
    this.seoService.setStructuredData('about-me', {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Natalia Ferreira',
      jobTitle: 'Psicóloga Clínica',
      description: 'Psicóloga Clínica e Orientadora de Carreira especializada em Terapia Relacional Sistêmica',
      image: `${SITE_URL}/assets/NatiAboutMe.webp`,
      url: SITE_URL,
      telephone: WHATSAPP_NUMBER,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Florianópolis',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      hasCredential: 'CRP 12/19892',
    });
  }

  ngOnDestroy(): void {
    // Don't leave homepage-only schema on the DOM during SPA navigation.
    this.seoService.removeStructuredData('about-me');
  }
}
