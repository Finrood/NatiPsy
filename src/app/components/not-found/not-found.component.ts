import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { PERSON_NAME, SITE_URL } from '../../config/contact';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: `Página Não Encontrada | ${PERSON_NAME}`,
      description: 'A página que você está procurando não foi encontrada.',
      url: `${SITE_URL}/404`,
      robots: 'noindex, follow',
    });
  }
}
