import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  shopBaseUrl: string = '';

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = this.cartService.getSubtotal();
    });

    // Get shop base URL
    this.shopService.currentShop$.subscribe(shop => {
      if (shop) {
        this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
      }
    });
  }

  increaseQuantity(productId: string): void {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: string): void {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  get grandTotal(): number {
    return this.subtotal;
  }

  // Format price with shop currency
  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  continueShopping(): void {
    this.router.navigate([`${this.shopBaseUrl}/store`]);
  }

  proceedToCheckout(): void {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      // Navigate to checkout page
      this.router.navigate([`${this.shopBaseUrl}/checkout`]);
    } else {
      // Store intended destination and show login
      // For now, just navigate to home which will trigger login modal
      alert('Please login to proceed to checkout');
      this.router.navigate([this.shopBaseUrl]);
    }
  }
}
