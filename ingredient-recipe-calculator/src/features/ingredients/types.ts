export type Unit = 'lb' | 'oz' | 'g' | 'kg' | 'cup' | 'tbsp' | 'tsp' | 'ml' | 'l' | 'piece';

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