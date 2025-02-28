import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  private phoneNumber: string = '+554884323764';
  private message: string = '';

  get whatsappLink(): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
  }
}
