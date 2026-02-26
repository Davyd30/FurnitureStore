import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';

interface Category {
  id: number;
  title: string;
  slug: string;
  image: string;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class CategoriesComponent implements OnInit {
  shopBaseUrl = '';

  categories: Category[] = [
    {
      id: 1,
      title: 'Living Room',
      slug: 'living-room',
      image: 'images/living-room.png'
    },
    {
      id: 2,
      title: 'Bedroom',
      slug: 'bedroom',
      image: 'images/bedroom.png'
    },
    {
      id: 3,
      title: 'Kitchen',
      slug: 'kitchen',
      image: 'images/kitchen.png'
    },
    {
      id: 4,
      title: 'Office',
      slug: 'office',
      image: 'images/office.png'
    }
  ];

  constructor(
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get shop base URL
    this.shopService.currentShop$.subscribe(shop => {
      if (shop) {
        this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
      }
    });
  }

  navigateToCategory(categorySlug: string): void {
    this.router.navigate([`${this.shopBaseUrl}/store`], { queryParams: { category: categorySlug } });
  }
}
