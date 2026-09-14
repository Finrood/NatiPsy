import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { PERSON_NAME, WHATSAPP_LINK } from './config/contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenuComponent, FooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = PERSON_NAME;
  readonly whatsappLink = WHATSAPP_LINK;
}
