import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ingredient } from '../features/recipes/types';

interface IngredientStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  clearIngredients: () => void;
}

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set) => ({
      ingredients: [],
      addIngredient: (ingredient) =>
        set((state) => ({
          ingredients: [...state.ingredients, ingredient],
        })),
      updateIngredient: (id, updatedIngredient) =>
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, ...updatedIngredient } : ingredient
          ),
        })),
      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id),
        })),
      clearIngredients: () => set({ ingredients: [] }),
    }),
    {
      name: 'ingredient-storage',
      skipHydration: false,
    }
  )
); 