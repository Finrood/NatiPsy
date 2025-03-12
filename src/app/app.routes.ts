import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';
import {BlogListComponent} from './components/blog-list/blog-list.component';
import {BlogPostComponent} from './components/blog-post/blog-post.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: HomeComponent },
    {
      path: 'blog',
      children: [
        { path: '', component: BlogListComponent },
        { path: ':slug', component: BlogPostComponent }
      ]
    },
    { path: '**', component: NotFoundComponent }
];
