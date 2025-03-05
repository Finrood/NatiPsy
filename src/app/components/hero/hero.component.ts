import {Component, Input, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Meta} from '@angular/platform-browser';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  private phoneNumber: string = '+554884323764';
  private message: string = '';

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
        "telephone": "+554884323764",
        "priceRange": "$$",
        "sameAs": [
          "https://www.instagram.com/curacriativa/",
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

  get whatsappLink(): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
  }
}
