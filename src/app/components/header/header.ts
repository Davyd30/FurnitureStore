import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';
import { Shop } from '../../models/shop.interface';
import { User } from '../../models/user.interface';
import { LoginModalComponent } from '../login-modal/login-modal';
import { RegisterModalComponent } from '../register-modal/register-modal';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, LoginModalComponent, RegisterModalComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  cartCount = 0;
  shop: Shop | null = null;
  shopBaseUrl = '';
  currentUser: User | null = null;
  showLoginModal = false;
  showRegisterModal = false;
  showUserMenu = false;

  constructor(
    private cartService: CartService,
    private shopService: ShopService,
    private authService: AuthService
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

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.showUserMenu = false;
  }

  openRegisterModal() {
    this.showRegisterModal = true;
    this.showUserMenu = false;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  switchToRegister() {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  switchToLogin() {
    this.showRegisterModal = false;
    this.showLoginModal = true;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
