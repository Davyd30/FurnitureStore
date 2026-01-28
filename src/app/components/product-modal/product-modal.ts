import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-8" 
         (click)="closeModal()" *ngIf="product">
      <div class="bg-white rounded-2xl w-[70%] max-w-[1200px] max-h-[90vh] overflow-hidden relative shadow-2xl" 
           (click)="$event.stopPropagation()">
        <button class="absolute top-4 right-4 bg-white border-none text-4xl w-10 h-10 rounded-full cursor-pointer z-10 shadow-md hover:bg-gray-100 hover:scale-110 transition-all flex items-center justify-center leading-none pb-1" 
                (click)="closeModal()">&times;</button>
        
        <div class="grid grid-cols-2 h-[80vh] max-h-[800px]">
          <!-- Left side - Image carousel -->
          <div class="p-8 flex flex-col gap-4 bg-gray-50">
            <div class="flex-1 flex items-center justify-center bg-white rounded-xl overflow-hidden">
              <img [src]="currentImage" [alt]="product.name" class="max-w-full max-h-full object-contain" />
            </div>
            <div class="flex gap-2 justify-center">
              @for (img of images; track img.name) {
                <div class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-3 transition-all hover:border-blue-500"
                     [class.border-blue-600]="currentImage === img.url"
                     [class.border-transparent]="currentImage !== img.url"
                     (click)="selectImage(img.url)">
                  <img [src]="img.url" [alt]="img.name" 
                       class="w-full h-full object-cover"
                       (error)="$event.target.style.display='none'" />
                </div>
              }
            </div>
          </div>

          <!-- Right side - Product details -->
          <div class="p-8 overflow-y-auto flex flex-col gap-6 justify-center">
            <h2 class="text-3xl m-0 text-gray-800">{{ product.name }}</h2>
            <p class="text-3xl font-bold text-green-600 m-0">{{ formatPrice(product.price) }}</p>
            
            <div class="flex flex-col gap-2">
              <h3 class="text-xl m-0 text-gray-700">Description</h3>
              <p class="text-gray-600 leading-relaxed">{{ product.description || 'No description available' }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-xl m-0 text-gray-700">Categories</h3>
              <div class="flex flex-wrap gap-2">
                @for (cat of product.category; track cat) {
                  <span class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm capitalize">{{ cat }}</span>
                }
              </div>
            </div>

            <button class="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg text-lg font-bold cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0" 
                    (click)="onAddToCart()">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 768px) {
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();

  images: { name: string; url: string }[] = [];
  currentImage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    if (this.product) {
      this.loadImages();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.loadImages();
    }
  }

  loadImages(): void {
    if (!this.product) return;

    const s3BaseUrl = 'https://pj300-shop-products.s3.eu-west-1.amazonaws.com';
    const imageNames = ['main', 'front', 'left', 'right'];
    
    this.images = imageNames.map(name => ({
      name: name,
      url: `${s3BaseUrl}/${this.product!.shopId}/${this.product!._id}/${name}.png`
    }));

    // Use the product's existing image as current (which is the main image)
    this.currentImage = this.product.image || this.images[0].url;
  }

  selectImage(url: string): void {
    this.currentImage = url;
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  onAddToCart(): void {
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
