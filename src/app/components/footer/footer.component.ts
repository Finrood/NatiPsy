import { Component, ChangeDetectionStrategy } from '@angular/core';
import {EMAIL_LINK, INSTAGRAM_LINK, WHATSAPP_LINK} from '../../config/contact';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  instagramLink = INSTAGRAM_LINK;
  whatsappLink = WHATSAPP_LINK;
  emailLink = EMAIL_LINK;
}
