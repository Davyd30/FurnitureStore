import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShopService } from './services/shop.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('furniture-store');
  private shopService = inject(ShopService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Update favicon and title based on shop
    this.shopService.currentShop$.subscribe(shop => {
      if (shop && isPlatformBrowser(this.platformId)) {
        // Update document title
        document.title = shop.title;
        
        // Update favicon if provided
        if (shop.favIcon) {
          this.updateFavicon(shop.favIcon);
        }
      }
    });
  }

  private updateFavicon(iconUrl: string): void {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = iconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}
