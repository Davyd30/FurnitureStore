export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string[];
  shopId: string;
  description?: string;
  createdAt: string;
  image?: string;
}
