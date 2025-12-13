import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://pj300-express.onrender.com/api/v1/products';
  private s3BaseUrl = 'https://pj300-shop-products.s3.eu-west-1.amazonaws.com';

  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => {
        const productsWithImages = products.map(product => ({
          ...product,
          image: `${this.s3BaseUrl}/${product.shopId}/${product._id}/main.png`
        }));
        this.productsSubject.next(productsWithImages);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products =>
        products.filter(product =>
          product.category.includes(category)
        )
      )
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(product => product._id === id))
    );
  }

  getModelUrl(shopId: string, productId: string): string {
    return `${this.s3BaseUrl}/${shopId}/${productId}/model.glb`;
  }

  getImageUrl(shopId: string, productId: string): string {
    return `${this.s3BaseUrl}/${shopId}/${productId}/main.png`;
  }

  refreshProducts(): void {
    this.loadProducts();
  }
}
