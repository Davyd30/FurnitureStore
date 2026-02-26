import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Shop } from '../models/shop.interface';
import { ShopService } from '../services/shop.service';
import { catchError, tap, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

// Resolver to load shop data before route activates
export const shopResolver: ResolveFn<Shop | null> = (route): Observable<Shop | null> => {
  const shopService = inject(ShopService);
  const router = inject(Router);
  const shopTitle = route.paramMap.get('shopTitle');

  if (!shopTitle) {
    return of(null);
  }

  return shopService.getShopByTitle(shopTitle).pipe(
    map(shop => shop || null),
    tap(shop => {
      if (shop) {
        shopService.setCurrentShop(shop);
      } else {
        // Navigate to 404 if shop not found
        router.navigate(['/404'], { skipLocationChange: false });
      }
    }),
    catchError(() => {
      router.navigate(['/404'], { skipLocationChange: false });
      return of(null);
    })
  );
};
