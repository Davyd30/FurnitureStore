import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  id: number;
  title: string;
  slug: string;
  image: string;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      id: 1,
      title: 'Living Room',
      slug: 'living-room',
      image: 'https://via.placeholder.com/300x200/3498db/ffffff?text=Living+Room'
    },
    {
      id: 2,
      title: 'Bedroom',
      slug: 'bedroom',
      image: 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=Bedroom'
    },
    {
      id: 3,
      title: 'Kitchen',
      slug: 'kitchen',
      image: 'https://via.placeholder.com/300x200/2ecc71/ffffff?text=Kitchen'
    },
    {
      id: 4,
      title: 'Office',
      slug: 'office',
      image: 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Office'
    },
    {
      id: 5,
      title: 'Bathroom',
      slug: 'bathroom',
      image: 'https://via.placeholder.com/300x200/9b59b6/ffffff?text=Bathroom'
    }
  ];
}
