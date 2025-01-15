import { Ingredient } from '@/features/ingredients/types';
import { Recipe } from '@/features/recipes/types';

export interface User {
  username: string;
  id: string;
}

export interface UserData {
  ingredients: Ingredient[];
  recipes: Recipe[];
} 