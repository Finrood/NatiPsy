import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  instagramLink: string = 'https://www.instagram.com/curacriativa/';
  whatsappLink: string = 'https://wa.me/+554884323764';
  emailLink: string = 'mailto:psinataliaferreira@gmail.com';
}
