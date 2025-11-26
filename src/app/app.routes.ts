import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./features/catalog/pages/catalog/catalog').then(m => m.Catalog),
  },
  {
    path: 'category/:category',
    loadComponent: () =>
      import('./features/categories/pages/category/category').then(m => m.CategoryComponent),
  },
  { path: '**', redirectTo: '' }
];
