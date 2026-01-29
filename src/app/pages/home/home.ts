import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroComponent } from '../../components/hero/hero';
import { CategoriesComponent } from '../../components/categories/categories';
import { FeaturedProductsComponent } from '../../components/featured-products/featured-products';
import { FooterComponent } from '../../components/footer/footer';
import { ProductModalComponent } from '../../components/product-modal/product-modal';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    HeroComponent,
    CategoriesComponent,
    FeaturedProductsComponent,
    FooterComponent,
    ProductModalComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  selectedProduct: Product | null = null;
  showProductModal = false;

  openProductModal(product: Product): void {
    this.selectedProduct = product;
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }
}
