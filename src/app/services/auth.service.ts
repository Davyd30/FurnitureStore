import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of, throwError, catchError } from 'rxjs';
import { User, UserRegistration, LoginCredentials, AuthResponse } from '../models/user.interface';
import { ShopService } from './shop.service';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://pj300-express.onrender.com/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private shopService: ShopService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  register(userData: UserRegistration): Observable<AuthResponse> {
    // Hash the password before sending to backend
    const hashedData = {
      ...userData,
      passwordHash: bcrypt.hashSync(userData.passwordHash, 10)
    };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/users`, hashedData).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Get current shop
    const currentShop = this.shopService.getCurrentShop();
    
    if (!currentShop) {
      return throwError(() => new Error('Shop information not available'));
    }
    
    // Get all users and find matching email
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Find user with matching email and valid bcrypt hash (starts with $2a$ or $2b$)
        const user = users.find(u => 
          u.email === credentials.email
        );
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        // Check if user belongs to current shop
        if (user.shopId !== currentShop._id) {
          throw new Error('This account cannot be used for this shop');
        }
        
        // Compare password with hash
        const isMatch = bcrypt.compareSync(credentials.password, user.passwordHash);
        
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }
        
        return { user };
      }),
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
