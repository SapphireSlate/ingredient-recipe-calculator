export enum Unit {
  LB = 'lb',
  OZ = 'oz',
  G = 'g',
  KG = 'kg',
  CUP = 'cup',
  TBSP = 'tbsp',
  TSP = 'tsp',
  ML = 'ml',
  L = 'l',
  PIECE = 'piece'
}

export type Category = 'Produce' | 'Meat' | 'Dairy' | 'Dry Goods' | 'Spices' | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  price: string;
  amount: string;
  unit: Unit;
  category: Category;
  unitPrice: number;
}

export interface NewIngredient {
  name: string;
  price: string;
  amount: string;
  unit: Unit;
  category: Category;
} 