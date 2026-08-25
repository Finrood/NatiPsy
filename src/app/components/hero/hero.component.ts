import {Component, Input, OnInit, Inject, PLATFORM_ID, ChangeDetectionStrategy} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Meta} from '@angular/platform-browser';
import {isPlatformBrowser} from '@angular/common';
import {INSTAGRAM_LINK, WHATSAPP_LINK, WHATSAPP_NUMBER} from '../../config/contact';

@Component({
  selector: 'app-hero',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  readonly whatsappLink = WHATSAPP_LINK;

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.addStructuredData();
    }
  }

  private addStructuredData() {
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Natalia Ferreira - Psicóloga Clínica",
        "image": "https://psicologanataliaferreira.com/assets/NatiHero.webp",
        "description": "Psicóloga Clínica especializada em Terapia Relacional Sistêmica",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Atendimento Online",
          "addressCountry": "BR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "-27.5969",
          "longitude": "-48.5495"
        },
        "url": "https://psicologanataliaferreira.com",
        "telephone": WHATSAPP_NUMBER,
        "priceRange": "$$",
        "sameAs": [
          INSTAGRAM_LINK
        ]
      }
    ];

    structuredData.forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }
}
