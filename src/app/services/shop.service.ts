import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Shop } from '../models/shop.interface';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private http = inject(HttpClient);
  private apiUrl = 'https://pj300-express.onrender.com/api/v1/shops';

  // Current active shop
  private currentShopSubject = new BehaviorSubject<Shop | null>(null);
  public currentShop$ = this.currentShopSubject.asObservable();

  // Get all shops
  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl);
  }

  // Get shop by URL-friendly title
  getShopByTitle(urlTitle: string): Observable<Shop | undefined> {
    return this.getShops().pipe(
      map(shops => shops.find(shop => this.titleToUrl(shop.title) === urlTitle))
    );
  }

  // Set current shop
  setCurrentShop(shop: Shop | null): void {
    this.currentShopSubject.next(shop);
  }

  // Get current shop value
  getCurrentShop(): Shop | null {
    return this.currentShopSubject.value;
  }

  // Convert title to URL format (replace spaces with dashes)
  titleToUrl(title: string): string {
    if (!title) return '';
    return title.replace(/\s+/g, '-').toLowerCase();
  }

  // Convert URL back to title format
  urlToTitle(url: string): string {
    if (!url) return '';
    return url.replace(/-/g, ' ');
  }
}
