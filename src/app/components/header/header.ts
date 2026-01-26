import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ShopService } from '../../services/shop.service';
import { Shop } from '../../models/shop.interface';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  cartCount = 0;
  shop: Shop | null = null;
  shopBaseUrl = '';

  constructor(
    private cartService: CartService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart items
    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = this.cartService.getCartCount();
    });

    // Subscribe to current shop
    this.shopService.currentShop$.subscribe(shop => {
      this.shop = shop;
      if (shop) {
        this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
