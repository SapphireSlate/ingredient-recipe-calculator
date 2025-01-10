import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe } from '../features/recipes/types';

interface RecipeStore {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  clearRecipes: () => void;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      recipes: [],
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, recipe],
        })),
      updateRecipe: (id, updatedRecipe) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
          ),
        })),
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        })),
      clearRecipes: () => set({ recipes: [] }),
    }),
    {
      name: 'recipe-storage',
      skipHydration: false,
    }
  )
); 