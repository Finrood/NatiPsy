import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { HeroComponent } from '../hero/hero.component';
import { ServicesComponent } from '../services/services.component';
import { ApproachComponent } from '../approach/approach.component';
import { AdvantagesComponent } from '../advantages/advantages.component';
import { SeoService } from '../../services/seo.service';
import { BlogPreviewComponent } from '../blog-preview/blog-preview.component';
import { PERSON_NAME, SITE_URL, WHATSAPP_NUMBER } from '../../config/contact';
import { SITE_CONFIG } from '../../config/site-config';

export function homepageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: `${PERSON_NAME} | Psicóloga Clínica`,
        inLanguage: SITE_CONFIG.locale,
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${SITE_URL}/#person` },
        about: { '@id': `${SITE_URL}/#service` },
        inLanguage: SITE_CONFIG.locale,
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON_NAME,
        jobTitle: 'Psicóloga Clínica',
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/assets/NatiAboutMe.webp`,
        telephone: WHATSAPP_NUMBER,
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#service`,
        name: `${PERSON_NAME} - Psicóloga Clínica`,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}${SITE_CONFIG.defaultImage}`,
        provider: { '@id': `${SITE_URL}/#person` },
      },
    ],
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AboutMeComponent,
    HeroComponent,
    ServicesComponent,
    ApproachComponent,
    AdvantagesComponent,
    BlogPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white min-h-screen relative">
      <div class="relative z-0">
        <app-hero id="inicio"></app-hero>
        <app-services id="meus-servicos"></app-services>
        <app-approach id="abordagem"></app-approach>
        <app-advantages id="vantagens"></app-advantages>
        <app-about-me id="sobre-mim"></app-about-me>
        <app-blog-preview id="blog"></app-blog-preview>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setStructuredData('homepage-entities', homepageStructuredData());
    this.seoService.updateMetaTags({
      title: `Psicóloga ${PERSON_NAME} | Terapia Online - ${SITE_CONFIG.credential}`,
      description: SITE_CONFIG.siteDescription,
      keywords: 'psicóloga online, terapia online, psicoterapia, terapia sistêmica, terapia de casal, psicóloga florianópolis',
      url: `${SITE_URL}/`,
      imageWidth: 853,
      imageHeight: 1280,
      imageType: 'image/webp',
      imageAlt: 'Natalia Ferreira - Psicóloga Clínica',
    });
  }

  ngOnDestroy(): void {
    this.seoService.removeStructuredData('homepage-entities');
  }
}
