import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-me',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent implements OnInit {
  whatsappLink: string = 'https://wa.me/+554884323764';

  constructor(
    private meta: Meta, 
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.updateMetaTags();
    if (isPlatformBrowser(this.platformId)) {
      this.addStructuredData();
    }
  }

  private updateMetaTags() {
    this.meta.updateTag({ 
      name: 'description', 
      content: 'Psicóloga Natalia Ferreira - CRP 12/19892. Especialista em Terapia Relacional Sistêmica, graduada pela UFSC, com experiência em atendimento online.'
    });
  }

  private addStructuredData() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Natalia Ferreira",
      "jobTitle": "Psicóloga Clínica",
      "description": "Psicóloga Clínica e Orientadora de Carreira especializada em Terapia Relacional Sistêmica",
      "image": "/assets/NatiAboutMe.webp",
      "url": "https://psicologanataliaferreira.com",
      "telephone": "+554884323764",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Florianópolis",
        "addressRegion": "SC",
        "addressCountry": "BR"
      },
      "hasCredential": "CRP 12/19892"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
