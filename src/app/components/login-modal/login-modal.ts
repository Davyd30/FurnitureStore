import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/user.interface';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50" 
         (click)="closeModal()">
      <div class="bg-white rounded-2xl w-[90%] max-w-[450px] p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-gray-200" 
           (click)="$event.stopPropagation()">
        <button class="absolute top-4 right-4 bg-white border-none text-gray-600 text-4xl w-10 h-10 rounded-full cursor-pointer z-10 shadow-md hover:bg-gray-100 hover:scale-110 transition-all flex items-center justify-center leading-none pb-1" 
                (click)="closeModal()">&times;</button>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Login</h2>
        
        @if (errorMessage) {
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ errorMessage }}
          </div>
        }
        
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required 
              class="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required 
              class="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            [disabled]="isLoading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          
          <div class="text-center text-sm text-gray-600 mt-2">
            Don't have an account? 
            <button 
              type="button" 
              (click)="switchToRegister()" 
              class="text-blue-600 hover:underline font-semibold"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() switchToRegisterModal = new EventEmitter<void>();
  
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid email or password';
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
  
  switchToRegister(): void {
    this.switchToRegisterModal.emit();
  }
}
