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
    <div class="shop-list-container">
      <h1>Available Shops</h1>
      <div class="shops-grid">
        @for (shop of shops; track shop._id) {
          <div class="shop-card" (click)="navigateToShop(shop)">
            <img *ngIf="shop.logo" [src]="shop.logo" [alt]="shop.name" class="shop-logo" />
            <h2>{{ shop.title }}</h2>
            <p>{{ shop.slogan }}</p>
            <button>Visit Store</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .shop-list-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    .shops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    .shop-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      cursor: pointer;
      transition: transform 0.2s;
      text-align: center;
    }
    .shop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .shop-logo {
      height: 60px;
      margin-bottom: 1rem;
    }
    button {
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ShopListComponent implements OnInit {
  shops: Shop[] = [];

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
