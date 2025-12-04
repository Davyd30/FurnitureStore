import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-featured-products',
  imports: [CommonModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProductsComponent {
  constructor(private cartService: CartService) {}

  products: Product[] = [
    {
      id: 1,
      title: 'Modern Sofa',
      price: 899.99,
      image: 'https://via.placeholder.com/300x250/3498db/ffffff?text=Modern+Sofa'
    },
    {
      id: 2,
      title: 'Elegant Dining Table',
      price: 1299.99,
      image: 'https://via.placeholder.com/300x250/e74c3c/ffffff?text=Dining+Table'
    },
    {
      id: 3,
      title: 'Comfort Armchair',
      price: 449.99,
      image: 'https://via.placeholder.com/300x250/2ecc71/ffffff?text=Armchair'
    },
    {
      id: 4,
      title: 'King Size Bed',
      price: 1599.99,
      image: 'https://via.placeholder.com/300x250/f39c12/ffffff?text=King+Bed'
    }
  ];

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image
    });
  }
}
