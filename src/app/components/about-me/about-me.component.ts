import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { CREDENTIAL, PERSON_NAME, SITE_URL, WHATSAPP_LINK, WHATSAPP_NUMBER } from '../../config/contact';
import { SITE_CONFIG } from '../../config/site-config';
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
      name: PERSON_NAME,
      jobTitle: 'Psicóloga Clínica',
      description: SITE_CONFIG.specialization,
      image: `${SITE_URL}/assets/NatiAboutMe.webp`,
      url: SITE_URL,
      telephone: WHATSAPP_NUMBER,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Florianópolis',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      hasCredential: CREDENTIAL,
    });
  }

  ngOnDestroy(): void {
    // Don't leave homepage-only schema on the DOM during SPA navigation.
    this.seoService.removeStructuredData('about-me');
  }
}
