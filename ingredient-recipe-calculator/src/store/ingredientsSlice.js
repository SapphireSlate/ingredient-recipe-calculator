import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action) => {
      return Array.isArray(action.payload) ? action.payload : [];
    },
    addIngredient: (state, action) => {
      state.push(action.payload);
    },
    updateIngredient: (state, action) => {
      const index = state.findIndex(ingredient => ingredient.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { setIngredients, addIngredient, updateIngredient } = ingredientsSlice.actions;

export default ingredientsSlice.reducer;
