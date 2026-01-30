import { Routes } from '@angular/router';
import { shopResolver } from './resolvers/shop.resolver';

export const routes: Routes = [
  // Landing page - list all shops
  {
    path: '',
    loadComponent: () =>
      import('./pages/shop-list/shop-list').then(m => m.ShopListComponent),
  },
  // 404 page
  {
    path: '404',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
  },
  // Shop-specific routes with title-based URL
  {
    path: ':shopTitle',
    resolve: { shop: shopResolver },
    children: [
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
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then(m => m.ProfileComponent),
      },
    ]
  },
  // 404 page for any unmatched routes
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
  }
];
