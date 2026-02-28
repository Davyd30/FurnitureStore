import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/user.interface';
import { Shop } from '../../models/shop.interface';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanelComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'website' | 'products' | 'users' = 'website';

  // Tab 1: Edit Website
  shop: Shop | null = null;
  shopForm = { name: '', slogan: '', logo: '', heroImage: '', buttonText: '' };
  shopSaveMessage = '';
  shopSaveError = '';
  shopLoading = false;

  // Tab 2: Products
  products: Product[] = [];
  editingProductId: string | null = null;
  productEditForm = { name: '', description: '', price: 0 };
  productSaveMessage = '';
  productSaveError = '';
  productsLoading = false;

  // Tab 3: Users
  users: User[] = [];
  userDeleteMessage = '';
  userDeleteError = '';
  usersLoading = false;

  // Mobile sidebar
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role.toLowerCase() !== 'admin') {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadShop();
    this.loadProducts();
    this.loadUsers();
  }

  setActiveTab(tab: 'website' | 'products' | 'users'): void {
    this.activeTab = tab;
    this.sidebarOpen = false;
    this.clearMessages();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // --- Tab 1: Edit Website ---

  loadShop(): void {
    if (!this.currentUser) return;
    this.shopLoading = true;
    this.adminService.getShopById(this.currentUser.shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.shopForm = {
          name: shop.name || '',
          slogan: shop.slogan || '',
          logo: shop.logo || '',
          heroImage: shop.heroImage || '',
          buttonText: shop.buttonText || 'Shop Now',
        };
        this.shopLoading = false;
      },
      error: () => {
        this.shopSaveError = 'Failed to load shop data';
        this.shopLoading = false;
      },
    });
  }

  saveShop(): void {
    if (!this.shop) return;
    this.clearMessages();
    this.shopLoading = true;
    this.adminService
      .updateShop(this.shop._id, {
        name: this.shopForm.name,
        slogan: this.shopForm.slogan,
        logo: this.shopForm.logo,
        heroImage: this.shopForm.heroImage,
        buttonText: this.shopForm.buttonText,
      })
      .subscribe({
        next: (updated) => {
          this.shop = { ...this.shop!, ...updated };
          this.shopSaveMessage = 'Website settings saved successfully!';
          this.shopLoading = false;
        },
        error: () => {
          this.shopSaveError = 'Failed to save changes';
          this.shopLoading = false;
        },
      });
  }

  // --- Tab 2: Products ---

  loadProducts(): void {
    if (!this.currentUser) return;
    this.productsLoading = true;
    this.adminService.getProductsByShop(this.currentUser.shopId).subscribe({
      next: (products) => {
        this.products = products;
        this.productsLoading = false;
      },
      error: () => {
        this.productSaveError = 'Failed to load products';
        this.productsLoading = false;
      },
    });
  }

  startEditProduct(product: Product): void {
    this.editingProductId = product._id;
    this.productEditForm = {
      name: product.name,
      description: product.description || '',
      price: product.price,
    };
    this.clearMessages();
  }

  cancelEditProduct(): void {
    this.editingProductId = null;
  }

  saveProduct(product: Product): void {
    this.clearMessages();
    this.adminService
      .updateProduct(product._id, {
        name: this.productEditForm.name,
        description: this.productEditForm.description,
        price: this.productEditForm.price,
      })
      .subscribe({
        next: (updated) => {
          const idx = this.products.findIndex((p) => p._id === product._id);
          if (idx !== -1) {
            this.products[idx] = { ...this.products[idx], ...updated };
          }
          this.editingProductId = null;
          this.productSaveMessage = 'Product updated successfully!';
        },
        error: () => {
          this.productSaveError = 'Failed to update product';
        },
      });
  }

  // --- Tab 3: Users ---

  loadUsers(): void {
    if (!this.currentUser) return;
    this.usersLoading = true;
    this.adminService.getUsersByShop(this.currentUser.shopId).subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
      },
      error: () => {
        this.userDeleteError = 'Failed to load users';
        this.usersLoading = false;
      },
    });
  }

  canDeleteUser(user: User): boolean {
    if (user._id === this.currentUser?._id) return false;
    if (user.role.toLowerCase() === 'admin') return false;
    return true;
  }

  deleteUser(user: User): void {
    if (!this.canDeleteUser(user)) return;
    if (!confirm(`Are you sure you want to delete user "${user.fullName}"?`)) return;
    this.clearMessages();
    this.adminService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u._id !== user._id);
        this.userDeleteMessage = 'User deleted successfully!';
      },
      error: () => {
        this.userDeleteError = 'Failed to delete user';
      },
    });
  }

  // --- Logout ---

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  private clearMessages(): void {
    this.shopSaveMessage = '';
    this.shopSaveError = '';
    this.productSaveMessage = '';
    this.productSaveError = '';
    this.userDeleteMessage = '';
    this.userDeleteError = '';
  }
}
