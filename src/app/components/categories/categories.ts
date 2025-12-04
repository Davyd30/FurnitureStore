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
      image: 'images/living-room.png'
    },
    {
      id: 2,
      title: 'Bedroom',
      slug: 'bedroom',
      image: 'images/bedroom.png'
    },
    {
      id: 3,
      title: 'Kitchen',
      slug: 'kitchen',
      image: 'images/kitchen.png'
    },
    {
      id: 4,
      title: 'Office',
      slug: 'office',
      image: 'images/office.png'
    }
  ];
}
