import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-category',
  imports: [CommonModule, RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class CategoryComponent implements OnInit {
  categoryName: string = '';
  products: Product[] = [];

  // Mock product data
  private allProducts: Product[] = [
    {
      id: 1,
      name: 'Modern Sofa',
      price: 899.99,
      image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=Modern+Sofa',
      description: 'Comfortable 3-seater sofa with modern design',
      category: 'living-room'
    },
    {
      id: 2,
      name: 'Coffee Table',
      price: 299.99,
      image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=Coffee+Table',
      description: 'Elegant wooden coffee table',
      category: 'living-room'
    },
    {
      id: 3,
      name: 'TV Stand',
      price: 399.99,
      image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=TV+Stand',
      description: 'Modern TV stand with storage',
      category: 'living-room'
    },
    {
      id: 4,
      name: 'Armchair',
      price: 449.99,
      image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=Armchair',
      description: 'Cozy armchair perfect for reading',
      category: 'living-room'
    },
    {
      id: 5,
      name: 'Queen Bed Frame',
      price: 699.99,
      image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Queen+Bed',
      description: 'Sturdy wooden bed frame',
      category: 'bedroom'
    },
    {
      id: 6,
      name: 'Nightstand',
      price: 149.99,
      image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Nightstand',
      description: 'Compact nightstand with drawer',
      category: 'bedroom'
    },
    {
      id: 7,
      name: 'Dresser',
      price: 499.99,
      image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Dresser',
      description: '6-drawer dresser with mirror',
      category: 'bedroom'
    },
    {
      id: 8,
      name: 'Wardrobe',
      price: 799.99,
      image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Wardrobe',
      description: 'Spacious wardrobe with sliding doors',
      category: 'bedroom'
    },
    {
      id: 9,
      name: 'Dining Table',
      price: 599.99,
      image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Dining+Table',
      description: 'Extendable dining table for 6-8 people',
      category: 'kitchen'
    },
    {
      id: 10,
      name: 'Dining Chairs',
      price: 179.99,
      image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Dining+Chairs',
      description: 'Set of 4 comfortable dining chairs',
      category: 'kitchen'
    },
    {
      id: 11,
      name: 'Kitchen Island',
      price: 899.99,
      image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Kitchen+Island',
      description: 'Mobile kitchen island with storage',
      category: 'kitchen'
    },
    {
      id: 12,
      name: 'Bar Stools',
      price: 199.99,
      image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Bar+Stools',
      description: 'Set of 2 adjustable bar stools',
      category: 'kitchen'
    },
    {
      id: 13,
      name: 'Office Desk',
      price: 449.99,
      image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=Office+Desk',
      description: 'L-shaped desk with cable management',
      category: 'office'
    },
    {
      id: 14,
      name: 'Office Chair',
      price: 299.99,
      image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=Office+Chair',
      description: 'Ergonomic office chair with lumbar support',
      category: 'office'
    },
    {
      id: 15,
      name: 'Bookshelf',
      price: 249.99,
      image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=Bookshelf',
      description: '5-tier bookshelf with modern design',
      category: 'office'
    },
    {
      id: 16,
      name: 'Filing Cabinet',
      price: 199.99,
      image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=Filing+Cabinet',
      description: '3-drawer filing cabinet with lock',
      category: 'office'
    },
    {
      id: 17,
      name: 'Vanity Cabinet',
      price: 399.99,
      image: 'https://via.placeholder.com/300x300/9b59b6/ffffff?text=Vanity+Cabinet',
      description: 'Bathroom vanity with sink and mirror',
      category: 'bathroom'
    },
    {
      id: 18,
      name: 'Storage Cabinet',
      price: 199.99,
      image: 'https://via.placeholder.com/300x300/9b59b6/ffffff?text=Storage+Cabinet',
      description: 'Wall-mounted bathroom storage',
      category: 'bathroom'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const categorySlug = params['category'];
      this.categoryName = this.formatCategoryName(categorySlug);
      this.loadProducts(categorySlug);
    });
  }

  private formatCategoryName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private loadProducts(categorySlug: string): void {
    this.products = this.allProducts.filter(
      product => product.category === categorySlug
    );
  }
}
