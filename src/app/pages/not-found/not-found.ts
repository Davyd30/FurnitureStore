import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">Sorry, the page you're looking for doesn't exist.</p>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .not-found-content {
      text-align: center;
      color: white;
    }
    .error-code {
      font-size: 8rem;
      font-weight: bold;
      margin: 0;
      line-height: 1;
    }
    .error-title {
      font-size: 2rem;
      margin: 1rem 0;
    }
    .error-message {
      font-size: 1.2rem;
      margin: 1rem 0 2rem;
      opacity: 0.9;
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}
