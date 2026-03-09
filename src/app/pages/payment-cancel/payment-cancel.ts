import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-8 font-sans">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div class="w-20 h-20 mx-auto mb-7">
          <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle class="circle" cx="26" cy="26" r="25" fill="none"/>
            <line class="cross1" x1="16" y1="16" x2="36" y2="36"/>
            <line class="cross2" x1="36" y1="16" x2="16" y2="36"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
        <p class="text-gray-500 leading-relaxed mb-8">
          Your payment was not completed. No charges have been made. You can return to your cart and try again.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            (click)="goToCart()"
            class="px-8 py-3 bg-gray-900 hover:bg-blue-900 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer">
            Back to Cart
          </button>
          <button
            (click)="goToShop()"
            class="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors duration-200 cursor-pointer">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .circle {
      stroke: #e74c3c;
      stroke-width: 2;
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      animation: stroke 0.6s cubic-bezier(0.65,0,0.45,1) forwards;
    }
    .cross1, .cross2 {
      stroke: #e74c3c;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 30;
      stroke-dashoffset: 30;
    }
    .cross1 { animation: stroke 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards; }
    .cross2 { animation: stroke 0.3s cubic-bezier(0.65,0,0.45,1) 0.7s forwards; }
    @keyframes stroke { to { stroke-dashoffset: 0; } }
  `]
})
export class PaymentCancelComponent implements OnInit {
  private shopUrl = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.shopUrl = this.route.snapshot.queryParamMap.get('shop') || '';
  }

  goToCart(): void {
    this.shopUrl ? this.router.navigate([`/${this.shopUrl}/cart`]) : this.router.navigate(['/']);
  }

  goToShop(): void {
    this.shopUrl ? this.router.navigate([`/${this.shopUrl}/`]) : this.router.navigate(['/']);
  }
}
