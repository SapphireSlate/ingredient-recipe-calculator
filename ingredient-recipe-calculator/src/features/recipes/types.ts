import { Unit } from '@features/ingredients/types';

export interface RecipeIngredient {
  ingredient: string;
  amount: number;
  unit: Unit;
}

export interface Recipe {
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
  monthlySales: number;
}

export interface NewRecipeIngredient {
  ingredient: string;
  amount: string;
  unit: Unit;
}

export interface NewRecipe {
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
  monthlySales: number;
} 