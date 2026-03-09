import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-8 font-sans">
      <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div class="w-20 h-20 mx-auto mb-7">
          <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle class="circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="tick" fill="none" d="M14 27 l8 8 l16-18"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p class="text-gray-500 leading-relaxed mb-8">
          Thank you for your purchase. Your order has been placed and you'll receive a confirmation email shortly.
        </p>
        <button
          (click)="goHome()"
          class="px-8 py-3 bg-gray-900 hover:bg-blue-900 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
  styles: [`
    .circle {
      stroke: #27ae60;
      stroke-width: 2;
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      animation: stroke 0.6s cubic-bezier(0.65,0,0.45,1) forwards;
    }
    .tick {
      stroke: #27ae60;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.4s cubic-bezier(0.65,0,0.45,1) 0.5s forwards;
    }
    @keyframes stroke {
      to { stroke-dashoffset: 0; }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private shopUrl = '';

  constructor(private cartService: CartService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.cartService.clearCart();
    this.shopUrl = this.route.snapshot.queryParamMap.get('shop') || '';
  }

  goHome(): void {
    this.shopUrl ? this.router.navigate([`/${this.shopUrl}/`]) : this.router.navigate(['/']);
  }
}
