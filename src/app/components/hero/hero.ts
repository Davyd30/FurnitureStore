import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { Shop } from '../../models/shop.interface';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit {
  shop: Shop | null = null;
  shopBaseUrl = '';

  constructor(
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current shop data
    this.shopService.currentShop$.subscribe(shop => {
      this.shop = shop;
      if (shop) {
        this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
      }
    });
  }

  navigateToStore(): void {
    this.router.navigate([`${this.shopBaseUrl}/store`]);
  }
}
