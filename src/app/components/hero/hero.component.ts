import { Component, ChangeDetectionStrategy } from '@angular/core';
import { WHATSAPP_LINK } from '../../config/contact';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly whatsappLink = WHATSAPP_LINK;
}
