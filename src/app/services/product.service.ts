import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Product } from '../models/product.interface';
import { ShopService } from './shop.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private shopService = inject(ShopService);
  private apiUrl = 'https://pj300-express.onrender.com/api/v1/products';
  private s3BaseUrl = 'https://pj300-shop-products.s3.eu-west-1.amazonaws.com';

  // Get all products (for backwards compatibility)
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map(products => products.map(product => ({
        ...product,
        image: `${this.s3BaseUrl}/${product.shopId}/${product._id}/main.png`
      })))
    );
  }

  // Get products for a specific shop from API
  getProductsByShop(shopId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/shop/${shopId}`).pipe(
      map(products => products.map(product => ({
        ...product,
        image: `${this.s3BaseUrl}/${product.shopId}/${product._id}/main.png`
      })))
    );
  }

  getProductsByCategory(category: string, shopId: string): Observable<Product[]> {
    return this.getProductsByShop(shopId).pipe(
      map(products =>
        products.filter(product =>
          product.category.includes(category)
        )
      )
    );
  }

  getProductById(id: string, shopId: string): Observable<Product | undefined> {
    return this.getProductsByShop(shopId).pipe(
      map(products => products.find(product => product._id === id))
    );
  }

  getModelUrl(shopId: string, productId: string): string {
    return `${this.s3BaseUrl}/${shopId}/${productId}/model.glb`;
  }

  getImageUrl(shopId: string, productId: string): string {
    return `${this.s3BaseUrl}/${shopId}/${productId}/main.png`;
  }

  // Get currency symbol from currency code
  private getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
    };
    return symbols[currency.toUpperCase()] || currency;
  }

  // Format price with currency from current shop
  formatPrice(price: number): string {
    const shop = this.shopService.getCurrentShop();
    const currency = shop?.currency || 'EUR';
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${price.toFixed(2)}`;
  }
}
