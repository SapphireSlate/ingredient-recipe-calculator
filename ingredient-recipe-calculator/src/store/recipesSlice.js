import { createSlice } from '@reduxjs/toolkit';

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: [],
  reducers: {
    setRecipes: (state, action) => {
      return action.payload;
    },
    addRecipe: (state, action) => {
      state.push(action.payload);
    },
    updateRecipe: (state, action) => {
      const { index, recipe } = action.payload;
      state[index] = recipe;
    },
    removeIngredientFromRecipe: (state, action) => {
      const { recipeIndex, ingredientIndex } = action.payload;
      state[recipeIndex].ingredients.splice(ingredientIndex, 1);
    },
    addIngredientToRecipe: (state, action) => {
      const { recipeIndex, ingredient } = action.payload;
      state[recipeIndex].ingredients.push(ingredient);
    },
    updateIngredientInRecipe: (state, action) => {
      const { recipeIndex, ingredientIndex, updatedIngredient } = action.payload;
      state[recipeIndex].ingredients[ingredientIndex] = updatedIngredient;
    },
  },
});

export const { 
  setRecipes, 
  addRecipe, 
  updateRecipe, 
  removeIngredientFromRecipe, 
  addIngredientToRecipe, 
  updateIngredientInRecipe 
} = recipesSlice.actions;

export default recipesSlice.reducer;