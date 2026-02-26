import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  shopBaseUrl: string = '';
  isEditing = false;
  
  // Editable user data
  editForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  };

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        // Redirect to home if not logged in
        const shop = this.shopService.getCurrentShop();
        if (shop) {
          const shopUrl = this.shopService.titleToUrl(shop.title);
          this.router.navigate([`/${shopUrl}`]);
        }
      } else {
        this.currentUser = user;
        this.loadUserData();
      }
    });

    // Set shop base URL
    const shop = this.shopService.getCurrentShop();
    if (shop) {
      this.shopBaseUrl = `/${this.shopService.titleToUrl(shop.title)}`;
    }
  }

  loadUserData(): void {
    if (this.currentUser) {
      this.editForm = {
        fullName: this.currentUser.fullName || '',
        email: this.currentUser.email || '',
        phoneNumber: this.currentUser.phoneNumber || '',
        address: this.currentUser.address || ''
      };
    }
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Cancel edit - reload original data
      this.loadUserData();
    }
    this.isEditing = !this.isEditing;
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Make API call to update user
      const response = await fetch(`https://pj300-express.onrender.com/api/v1/users/${this.currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: this.editForm.fullName,
          email: this.editForm.email,
          phoneNumber: this.editForm.phoneNumber,
          address: this.editForm.address
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Merge updated data with existing user data to preserve all fields
        const mergedUser = {
          ...this.currentUser,
          ...updatedUser
        };
        
        // Update current user in auth service
        this.authService.updateCurrentUser(mergedUser);
        
        // Update local user reference
        this.currentUser = mergedUser;
        
        // Exit edit mode
        this.isEditing = false;
        
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  }

  goBack(): void {
    this.router.navigate([this.shopBaseUrl]);
  }
}
