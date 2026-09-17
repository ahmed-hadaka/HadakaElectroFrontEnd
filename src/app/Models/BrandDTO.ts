import {CategorySelectDTO} from './CategoryDTO';

export interface BrandDTO {
  id: number;
  name: string;
  logo?: string;
  categories: CategorySelectDTO[] | null;
}

export interface BrandSelectDTO {
  id: number;
  name: string;
}
