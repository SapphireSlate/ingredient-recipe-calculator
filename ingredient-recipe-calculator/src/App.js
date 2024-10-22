import React from 'react';
import { Provider } from 'react-redux';
import store from './store/index';
import IngredientRecipeCalculator from './IngredientRecipeCalculator';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <Provider store={store}>
      <div className="container mx-auto p-4">
        <IngredientRecipeCalculator />
        <Dashboard />
      </div>
    </Provider>
  );
};

export default App;
