import { Unit } from '@/features/ingredients/types';

export interface RecipeIngredient {
  ingredient: string;
  amount: number;
  unit: Unit;
}

export interface NewRecipeIngredient {
  ingredient: string;
  amount: string;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
  monthlySales: number;
  prepTime: number;
  shelfLife: number;
}

export interface NewRecipe {
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
  monthlySales: number;
  prepTime: number;
  shelfLife: number;
} 