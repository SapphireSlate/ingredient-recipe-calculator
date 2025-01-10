import { Ingredient, Recipe } from '../features/recipes/types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateIngredient = (ingredient: Partial<Ingredient>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!ingredient.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (ingredient.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!ingredient.cost) {
    errors.push({ field: 'cost', message: 'Cost is required' });
  } else if (ingredient.cost < 0) {
    errors.push({ field: 'cost', message: 'Cost must be greater than or equal to 0' });
  }

  if (!ingredient.quantity) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (ingredient.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
  }

  if (!ingredient.unit) {
    errors.push({ field: 'unit', message: 'Unit is required' });
  }

  return errors;
};

export const validateRecipe = (recipe: Partial<Recipe>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!recipe.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (recipe.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'At least one ingredient is required' });
  } else {
    recipe.ingredients.forEach((ingredient, index) => {
      if (!ingredient.ingredientId) {
        errors.push({ field: `ingredients[${index}].ingredientId`, message: 'Ingredient is required' });
      }
      if (!ingredient.quantity || ingredient.quantity <= 0) {
        errors.push({ field: `ingredients[${index}].quantity`, message: 'Quantity must be greater than 0' });
      }
    });
  }

  if (!recipe.servings || recipe.servings <= 0) {
    errors.push({ field: 'servings', message: 'Number of servings must be greater than 0' });
  }

  return errors;
}; 