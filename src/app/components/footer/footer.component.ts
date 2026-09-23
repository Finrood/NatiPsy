import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMAIL_LINK, INSTAGRAM_LINK, WHATSAPP_LINK } from '../../config/contact';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly currentYear: number = new Date().getFullYear();
  readonly instagramLink = INSTAGRAM_LINK;
  readonly whatsappLink = WHATSAPP_LINK;
  readonly emailLink = EMAIL_LINK;
}
