import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SITE_URL, WHATSAPP_LINK } from '../../config/contact';

@Component({
  selector: 'app-trust-contact',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './trust-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustContactComponent implements OnInit, OnDestroy {
  private readonly seoService = inject(SeoService);
  readonly whatsappLink = WHATSAPP_LINK;

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Contato, privacidade e política editorial | Natalia Ferreira',
      description: 'Informações sobre contato inicial, privacidade, autoria e revisão do conteúdo profissional de Natalia Ferreira dos Santos, Psicóloga, CRP 12/19892.',
      keywords: 'contato psicóloga, privacidade, política editorial',
      url: `${SITE_URL}/contato-e-privacidade`,
    });
  }

  ngOnDestroy(): void {
    this.seoService.removeStructuredData('trust-contact');
  }
}
