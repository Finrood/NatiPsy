import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'terapia-online',
    loadComponent: () =>
      import('./components/service-page/service-page.component').then(
        (m) => m.ServicePageComponent,
      ),
    data: { pageKey: 'therapyOnline' },
  },
  {
    path: 'orientacao-profissional',
    loadComponent: () =>
      import('./components/service-page/service-page.component').then(
        (m) => m.ServicePageComponent,
      ),
    data: { pageKey: 'careerGuidance' },
  },
  {
    path: 'contato-e-privacidade',
    loadComponent: () =>
      import('./components/trust-contact/trust-contact.component').then(
        (m) => m.TrustContactComponent,
      ),
  },
  {
    path: 'blog',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/blog-list/blog-list.component').then((m) => m.BlogListComponent),
      },
      {
        path: 'page/:page',
        loadComponent: () =>
          import('./components/blog-list/blog-list.component').then((m) => m.BlogListComponent),
      },
      {
        path: ':slug',
        loadComponent: () =>
          import('./components/blog-post/blog-post.component').then((m) => m.BlogPostComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
