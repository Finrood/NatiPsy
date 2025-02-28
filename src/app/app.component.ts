import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AboutMeComponent} from './components/about-me/about-me.component';
import {FooterComponent} from './components/footer/footer.component';
import {TopMenuComponent} from './components/top-menu/top-menu.component';
import {HeroComponent} from './components/hero/hero.component';
import {ServicesComponent} from './components/services/services.component';
import {ApproachComponent} from './components/approach/approach.component';
import {AdvantagesComponent} from './components/advantages/advantages.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NatiPsy';
}
