import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { HeroComponent } from '../hero/hero.component';
import { ServicesComponent } from '../services/services.component';
import { ApproachComponent } from '../approach/approach.component';
import { AdvantagesComponent } from '../advantages/advantages.component';
import { SeoService } from '../../services/seo.service';
import { BlogListComponent } from '../blog-list/blog-list.component';
import { SITE_URL } from '../../config/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AboutMeComponent,
    HeroComponent,
    ServicesComponent,
    ApproachComponent,
    AdvantagesComponent,
    BlogListComponent
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
        <app-blog-list id="blog"></app-blog-list>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Psicóloga Natalia Ferreira | Terapia Online - CRP 12/19892',
      description: 'Psicóloga Clínica especializada em Terapia Relacional Sistêmica. Atendimento online para jovens, adultos e casais. Experiência em terapia sistêmica, ansiedade, depressão e relacionamentos.',
      keywords: 'psicóloga online, terapia online, psicoterapia, terapia sistêmica, terapia de casal, psicóloga florianópolis',
      url: `${SITE_URL}/`
    });
  }
}
