import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { ProductModalComponent } from '../../components/product-modal/product-modal';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ShopService } from '../../services/shop.service';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-store',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ProductModalComponent],
  templateUrl: './store.html',
  styleUrl: './store.css',
})
export class StoreComponent implements OnInit {
  sortBy: string = '';
  categoryFilter: string = '';
  allProducts: Product[] = [];
  selectedProduct: Product | null = null;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private shopService: ShopService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Check for category query param
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categoryFilter = params['category'];
      }
    });

    // Load products for current shop
    this.shopService.currentShop$.subscribe(shop => {
      if (shop) {
        this.productService.getProductsByShop(shop._id).subscribe(products => {
          this.allProducts = products;
        });
      }
    });
  }

  get sortedProducts(): Product[] {
    let products = [...this.allProducts];

    if (this.categoryFilter) {
      products = products.filter(product => product.category.includes(this.categoryFilter));
    }

    if (this.sortBy === 'price-low') {
      return products.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      return products.sort((a, b) => b.price - a.price);
    }

    return products;
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.categoryFilter = target.value;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image'
    });
  }

  // Format price with shop currency
  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  // Open product modal
  openProductModal(product: Product): void {
    this.selectedProduct = product;
  }

  // Close product modal
  closeProductModal(): void {
    this.selectedProduct = null;
  }

  // Add to cart from modal
  addToCartFromModal(product: Product): void {
    this.addToCart(product);
    this.closeProductModal();
  }
}
