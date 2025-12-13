import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'store',
    loadComponent: () =>
      import('./pages/store/store').then(m => m.StoreComponent),
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
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then(m => m.CartComponent),
  },
  {
    path: 'room-planner',
    loadComponent: () =>
      import('./features/room-planner/pages/room-planner/room-planner.component').then(m => m.RoomPlannerComponent),
  },
  { path: '**', redirectTo: '' }
];
