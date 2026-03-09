import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cartItems';
  private cartItems = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  cartItems$ = this.cartItems.asObservable();

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  addToCart(product: { id: string; name: string; price: number; image: string }): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { ...product, quantity: 1 }]);
    }
    this.persist(this.cartItems.value);
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.value;
    this.cartItems.next(currentItems.filter(item => item.id !== productId));
    this.persist(this.cartItems.value);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.persist(this.cartItems.value);
    }
  }

  getCartCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
