import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
import { User } from '../models/user.interface';
import { Shop } from '../models/shop.interface';
import { Product } from '../models/product.interface';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'https://pj300-express.onrender.com/api/v1';
  private s3BaseUrl = 'https://pj300-shop-products.s3.eu-west-1.amazonaws.com';

  adminLogin(email: string, password: string): Observable<{ user: User }> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        if (user.role.toLowerCase() !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }
        const isMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }
        return { user };
      }),
      catchError((error) => throwError(() => error))
    );
  }

  getShopById(shopId: string): Observable<Shop> {
    return this.http.get<Shop[]>(`${this.apiUrl}/shops`).pipe(
      map((shops) => {
        const shop = shops.find((s) => s._id === shopId);
        if (!shop) throw new Error('Shop not found');
        return shop;
      })
    );
  }

  updateShop(shopId: string, data: Partial<Shop>): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiUrl}/shops/${shopId}`, data);
  }

  getProductsByShop(shopId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/shop/${shopId}`).pipe(
      map((products) =>
        products.map((p) => ({
          ...p,
          image: `${this.s3BaseUrl}/${p.shopId}/${p._id}/main.png`,
        }))
      )
    );
  }

  updateProduct(productId: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${productId}`, data);
  }

  getUsersByShop(shopId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map((users) => users.filter((u) => u.shopId === shopId))
    );
  }

  deleteUser(userId: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
