import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EMAIL_LINK, INSTAGRAM_LINK, PERSON_NAME, WHATSAPP_LINK } from '../../config/contact';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly currentYear: number = new Date().getFullYear();
  readonly instagramLink = INSTAGRAM_LINK;
  readonly whatsappLink = WHATSAPP_LINK;
  readonly emailLink = EMAIL_LINK;
  readonly personName = PERSON_NAME;
}
