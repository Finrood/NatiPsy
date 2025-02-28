import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  // In NotFoundComponent:
  constructor(private router: Router, private meta: Meta, private title: Title) {
    this.title.setTitle('Página Não Encontrada | Natalia Ferreira');
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}