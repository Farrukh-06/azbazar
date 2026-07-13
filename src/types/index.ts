export interface Product {
  id: string;
  name: string;
  nameAz: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categoryAz: string;
  seller: string;
  sellerId: string;
  rating: number;
  reviews: number;
  description: string;
  descriptionAz: string;
  stock: number;
  badge?: 'new' | 'sale' | 'local' | 'hot';
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  nameAz: string;
  icon: string;
  count: number;
  color: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  description: string;
  descriptionAz: string;
  rating: number;
  reviews: number;
  products: number;
  location: string;
  joined: string;
  verified: boolean;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
