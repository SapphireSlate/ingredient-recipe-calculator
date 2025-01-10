export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  unit: Unit;
  quantity: number;
  description?: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  servings: number;
  category?: Category;
  instructions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'unit' | 'oz' | 'lb' | 'cup' | 'tbsp' | 'tsp';

export type Category = 'Dry Goods' | 'Dairy' | 'Meat' | 'Produce' | 'Spices' | 'Other'; 