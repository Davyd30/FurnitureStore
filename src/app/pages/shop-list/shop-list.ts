import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { Shop } from '../../models/shop.interface';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <!-- Hero -->
      <header class="hero">
        <div class="hero-inner">
          <span class="hero-eyebrow">Welcome</span>
          <h1 class="hero-title">Find Your Perfect Store</h1>
          <p class="hero-sub">Browse our curated collection of shops and discover something you'll love.</p>
        </div>
      </header>

      <!-- Shop grid -->
      <main class="main">
        @if (shops.length === 0) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading shops…</p>
          </div>
        } @else {
          <div class="grid">
            @for (shop of shops; track shop._id) {
              <article class="card" (click)="navigateToShop(shop)">
                <div class="card-accent" [style.background]="getAccentGradient(shop)">
                  <span class="card-accent-name">{{ shop.name }}</span>
                </div>
                <div class="card-body">
                  <p class="card-slogan">{{ shop.slogan || 'Discover our collection' }}</p>
                  <button class="card-btn" (click)="navigateToShop(shop); $event.stopPropagation()">
                    Visit Store
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </main>

      <footer class="foot">© {{ year }} All rights reserved.</footer>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #f5f6fa;
      color: #1a1a2e;
    }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
      color: #fff;
      padding: 5rem 2rem 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0; right: 0;
      height: 48px;
      background: #f5f6fa;
      clip-path: ellipse(55% 100% at 50% 100%);
    }
    .hero-inner { max-width: 600px; margin: 0 auto; }
    .hero-eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-bottom: 1rem;
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.6;
    }

    /* Main */
    .main {
      flex: 1;
      max-width: 1100px;
      width: 100%;
      margin: 3rem auto;
      padding: 0 2rem;
    }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.75rem;
    }

    /* Card */
    .card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      display: flex;
      flex-direction: column;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.13);
    }

    .card-accent {
      height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
    }
    .card-initial {
      font-size: 2.4rem;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      line-height: 1;
      text-shadow: 0 2px 8px rgba(0,0,0,0.18);
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .card-accent-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: rgba(255,255,255,0.95);
      letter-spacing: -0.01em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.2);
      text-align: center;
    }

    .card-body {
      padding: 1.5rem 1.75rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      flex: 1;
    }
    .card-slogan {
      font-size: 1.05rem;
      color: #6b7280;
      line-height: 1.5;
      flex: 1;
    }

    .card-btn {
      margin-top: 1.25rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.3rem;
      background: #1a1a2e;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s ease, gap 0.18s ease;
    }
    .card-btn:hover {
      background: #0f3460;
      gap: 0.65rem;
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 4rem 0;
      color: #9ca3af;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e5e7eb;
      border-top-color: #0f3460;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Footer */
    .foot {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.8rem;
      color: #9ca3af;
    }

    @media (max-width: 520px) {
      .hero { padding: 3.5rem 1.25rem 3rem; }
      .main { padding: 0 1.25rem; margin: 2rem auto; }
      .grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ShopListComponent implements OnInit {
  shops: Shop[] = [];
  year = new Date().getFullYear();

  private readonly gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
    'linear-gradient(135deg, #0f3460, #533483)',
  ];

  getAccentGradient(shop: Shop): string {
    const idx = [...(shop._id || 'a')].reduce((s, c) => s + c.charCodeAt(0), 0) % this.gradients.length;
    return this.gradients[idx];
  }

  constructor(
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load all shops
    this.shopService.getShops().subscribe(shops => {
      this.shops = shops.filter(shop => shop.title && shop.title.trim());
    });
  }

  navigateToShop(shop: Shop): void {
    if (!shop.title) return;
    const shopUrl = this.shopService.titleToUrl(shop.title);
    this.router.navigate([shopUrl]);
  }
}
