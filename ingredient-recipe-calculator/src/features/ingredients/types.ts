export type Unit = 'lb' | 'oz' | 'g' | 'kg' | 'cup' | 'tbsp' | 'tsp' | 'ml' | 'l' | 'piece';
export type Category = 'Dry Goods' | 'Dairy' | 'Produce' | 'Meat' | 'Other';

export interface Ingredient {
  name: string;
  price: number;
  amount: number;
  unit: Unit;
  unitPrice: number;
  category: Category;
}

export interface NewIngredient {
  name: string;
  price: string | number;
  amount: string | number;
  unit: Unit;
} 