@echo off
git checkout typescript-version
node ingredient-recipe-calculator/scripts/sync-feature.js recipes ingredient-recipe-calculator/src/features/recipes/components/RecipeManagement.tsx ingredient-recipe-calculator/src/features/recipes/components/IngredientRecipeCalculator.tsx ingredient-recipe-calculator/src/features/production/components/ProductionPlanning.tsx 