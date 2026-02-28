import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/user.interface';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLoginComponent {
  credentials: LoginCredentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    if (user && user.role.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.adminLogin(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.updateCurrentUser(response.user);
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed';
      },
    });
  }
}
