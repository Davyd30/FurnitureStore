import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  shopBaseUrl: string = '';
  currentUser: User | null = null;
  
  // Form fields
  fullName: string = '';
  phoneNumber: string = '';
  address: string = '';
  
  // Form validation
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Stripe payment link
  private stripePaymentUrl = 'https://buy.stripe.com/test_bJe00k0en7PLdXOcDRbII00';

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      // Redirect to cart if not logged in
      alert('Please login to proceed to checkout');
      this.router.navigate(['/']);
      return;
    }

    // Pre-fill form with existing user data
    this.fullName = this.currentUser.fullName || '';
    this.phoneNumber = this.currentUser.phoneNumber || '';
    this.address = this.currentUser.address || '';

    // Get cart items
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = this.cartService.getSubtotal();
      
      // Redirect if cart is empty
      if (this.cartItems.length === 0) {
        alert('Your cart is empty');
        this.router.navigate([this.shopBaseUrl || '/']);
      }
    });

    // Get shop base URL
    this.shopService.currentShop$.subscribe(shop => {
      if (shop) {
        this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
      }
    });
  }

  get grandTotal(): number {
    return this.subtotal;
  }

  // Format price with shop currency
  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.fullName.trim()) {
      this.errorMessage = 'Full name is required';
      return false;
    }

    if (!this.phoneNumber.trim()) {
      this.errorMessage = 'Phone number is required';
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(this.phoneNumber)) {
      this.errorMessage = 'Please enter a valid phone number';
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage = 'Address is required';
      return false;
    }

    return true;
  }

  processCheckout(): void {
    if (!this.validateForm()) {
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Update user information in database
    const updatedUser: User = {
      ...this.currentUser,
      fullName: this.fullName.trim(),
      phoneNumber: this.phoneNumber.trim(),
      address: this.address.trim()
    };

    this.authService.updateUserInfo(updatedUser).subscribe({
      next: (response: { user: User }) => {
        this.currentUser = response.user;
        this.successMessage = 'Redirecting to payment...';
        
        // Redirect to Stripe payment after a short delay
        setTimeout(() => {
          window.location.href = this.stripePaymentUrl;
        }, 1500);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to save checkout information. Please try again.';
        console.error('Checkout error:', error);
      }
    });
  }

  backToCart(): void {
    this.router.navigate([`${this.shopBaseUrl}/cart`]);
  }
}
