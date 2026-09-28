export interface ProductDTO {
  id: number;
  name: string;
  alias: string;
  categoryId: number;
  brandId: number;
  enabled: boolean;
  inStock: boolean;
  cost: number;
  price: number;
  discountPercent: number;
  shortDescription: string;
  fullDescription?: string;
  mainImage: string;
  productImages: ProductImage[] | null;
  productDetails: ProductDetail[] | null;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface ProductImage {
  name: string;
}

export interface ProductDetail {
  name: string;
  value: string;
}

export interface ProductListDTO {
  id: number;
  name: string;
  categoryName: string;
  mainImage?: string;
  brandName: string;
  enabled: boolean;
}
