import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-about-me',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent {
  whatsappLink: string = 'https://wa.me/+554884323764';
}
