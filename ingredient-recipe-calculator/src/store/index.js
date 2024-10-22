import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
import recipesReducer from './recipesSlice';
import overheadValuesReducer from './overheadValuesSlice';

const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    recipes: recipesReducer,
    overheadValues: overheadValuesReducer,
  },
});

export default store;
