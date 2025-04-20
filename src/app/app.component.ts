import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './components/footer/footer.component';
import {TopMenuComponent} from './components/top-menu/top-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenuComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NatiPsy';
}
