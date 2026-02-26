import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.interface';

@Component({
  selector: 'app-category',
  imports: [CommonModule, RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class CategoryComponent implements OnInit {
  categoryName: string = '';
  products: Product[] = [];
  allProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
      this.route.params.subscribe(params => {
        const categorySlug = params['category'];
        this.categoryName = this.formatCategoryName(categorySlug);
        this.loadProducts(categorySlug);
      });
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
      product => product.category.includes(categorySlug)
    );
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image'
    });
  }
}
