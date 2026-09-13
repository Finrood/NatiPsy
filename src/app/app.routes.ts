import { Routes } from '@angular/router';
import { BlogPostComponent } from './components/blog-post/blog-post.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'terapia-online',
    loadComponent: () =>
      import('./components/service-page/service-page.component').then(
        (m) => m.ServicePageComponent
      ),
    data: { pageKey: 'therapyOnline' },
  },
  {
    path: 'orientacao-profissional',
    loadComponent: () =>
      import('./components/service-page/service-page.component').then(
        (m) => m.ServicePageComponent
      ),
    data: { pageKey: 'careerGuidance' },
  },
  {
    path: 'blog',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/blog-list/blog-list.component').then(
            (m) => m.BlogListComponent
          ),
      },
      {
        path: ':slug',
        // Eager on purpose: lazy loadComponent evaluation during navigation
        // races activation in dev (ng serve) and freezes the view on its
        // first client-side visit; the component is small and always needed
        // for prerendered/SEO routes anyway.
        component: BlogPostComponent,
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
