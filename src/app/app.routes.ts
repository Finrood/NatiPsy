import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: AppComponent },
    { path: '**', component: NotFoundComponent }
];
