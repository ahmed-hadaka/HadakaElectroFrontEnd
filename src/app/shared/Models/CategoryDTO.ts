export interface CategoryListDTO {
  id: number;
  name: string;
  alias: string;
  image?: string;
  parent?: CategorySelectDTO | null;
  enabled: boolean;
}

export interface CategorySelectDTO {
  id: number;
  name: string;
}
