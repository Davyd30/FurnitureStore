import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { Product } from '../../models/product.interface';
import { Shop } from '../../models/shop.interface';

@Component({
  selector: 'app-featured-products',
  imports: [CommonModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProductsComponent implements OnInit {
  products: Product[] = [];
  shop: Shop | null = null;
  @Output() productClick = new EventEmitter<Product>();

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    // Get current shop
    this.shopService.currentShop$.subscribe(shop => {
      this.shop = shop;
      if (shop) {
        // Load products for this shop only
        this.productService.getProductsByShop(shop._id).subscribe(products => {
          this.products = products.slice(0, 4);
        });
      }
    });
  }

  // Format price with currency
  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || 'https://via.placeholder.com/300x250/cccccc/ffffff?text=No+Image'
    });
  }

  openProductModal(product: Product): void {
    this.productClick.emit(product);
  }
}
