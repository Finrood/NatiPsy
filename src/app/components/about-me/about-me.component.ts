import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { WHATSAPP_LINK } from '../../config/contact';

@Component({
  selector: 'app-about-me',
  imports: [NgOptimizedImage],
  templateUrl: './about-me.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeComponent {
  readonly whatsappLink = WHATSAPP_LINK;
}
