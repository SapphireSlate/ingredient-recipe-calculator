import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardContent, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Select, SelectItem } from "./components/ui/select";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { createAccount, login, logout, getCurrentUser, saveUserData, getUserData } from './utils/auth';
import BusinessOverheadCalculator from './components/ui/BusinessOverheadCalculator';
import { setIngredients, addIngredient, updateIngredient } from './store/ingredientsSlice';
import { setRecipes, addRecipe, updateRecipe, removeIngredientFromRecipe, addIngredientToRecipe, updateIngredientInRecipe } from './store/recipesSlice';
import { setOverheadValues, calculateOverheadPerUnit } from './store/overheadValuesSlice';
import Dashboard from './Dashboard';
const IngredientRecipeCalculator = () => {
  const ingredients = useSelector(state => state.ingredients) || [];
  const recipesFromStore = useSelector(state => state.recipes);
  const overheadValuesFromStore = useSelector(state => state.overheadValues);
  const dispatch = useDispatch();

  // Ensure ingredients, recipes, and overheadValues are always arrays or objects
  const recipes = Array.isArray(recipesFromStore) ? recipesFromStore : [];
  const overheadValues = typeof overheadValuesFromStore === 'object' ? overheadValuesFromStore : {};

  const [newIngredient, setNewIngredient] = useState({ name: '', price: '', amount: '', unit: '' });
  const [newRecipe, setNewRecipe] = useState({ name: '', ingredients: [], batchSize: 1 });
  const [newRecipeIngredient, setNewRecipeIngredient] = useState({ ingredient: '', amount: '', unit: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingRecipeIndex, setEditingRecipeIndex] = useState(null);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const units = ['oz', 'lb', 'cup', 'tbsp', 'tsp', 'count'];

  // Add this preset list of ingredients
  const presetIngredients = [
    { name: 'Flour', price: 2.5, amount: 5, unit: 'lb', unitPrice: 0.3125 },
    { name: 'Sugar', price: 3, amount: 4, unit: 'lb', unitPrice: 0.46875 },
    { name: 'Butter', price: 4, amount: 1, unit: 'lb', unitPrice: 0.25 },
    { name: 'Eggs', price: 3, amount: 12, unit: 'count', unitPrice: 0.25 },
    { name: 'Milk', price: 3.5, amount: 1, unit: 'cup', unitPrice: 0.4375 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedInUser = await getCurrentUser();
        if (loggedInUser) {
          setCurrentUser(loggedInUser);
          const userData = await getUserData(loggedInUser);
          if (userData) {
            if (userData.ingredients && userData.ingredients.length > 0) {
              dispatch(setIngredients(userData.ingredients));
            } else {
              dispatch(setIngredients(presetIngredients));
            }
            dispatch(setRecipes(userData.recipes || []));
            dispatch(setOverheadValues(userData.overheadValues || {}));
          }
        } else {
          const savedData = localStorage.getItem('ingredientRecipeData');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.ingredients && parsedData.ingredients.length > 0) {
              dispatch(setIngredients(parsedData.ingredients));
            } else {
              dispatch(setIngredients(presetIngredients));
            }
            dispatch(setRecipes(parsedData.recipes || []));
            dispatch(setOverheadValues(parsedData.overheadValues || {}));
          } else {
            dispatch(setIngredients(presetIngredients));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        dispatch(setIngredients(presetIngredients));
      }
    };
    fetchData();
  }, [dispatch]);
  
  useEffect(() => {
    const saveData = async () => {
      try {
        if (currentUser) {
          await saveUserData(currentUser, { ingredients, recipes, overheadValues });
        } else {
          const dataToSave = { ingredients, recipes, overheadValues };
          localStorage.setItem('ingredientRecipeData', JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error('Error saving data:', error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    };
    saveData();
  }, [currentUser, ingredients, recipes, overheadValues]);

  const handleCreateAccount = async () => {
    try {
      const result = await createAccount(username, password);
      if (result.success) {
        setCurrentUser(username);
        await saveUserData(username, { ingredients, recipes: [], overheadValues });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('An error occurred while creating the account. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const result = await login(username, password);
      if (result.success) {
        setCurrentUser(username);
        const userData = await getUserData(username);
        if (userData) {
          dispatch(setIngredients(userData.ingredients || []));
          dispatch(setRecipes(userData.recipes || []));
          dispatch(setOverheadValues(userData.overheadValues || {}));
        } else {
          await saveUserData(username, { ingredients, recipes, overheadValues });
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while logging in. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    // Clear local storage when logging out
    localStorage.removeItem('ingredientRecipeData');
    // Reset to initial state
    dispatch(setIngredients([]));
    dispatch(setRecipes([]));
    dispatch(setOverheadValues({
      overhead: {
        rent: 0,
        utilities: 0,
        wages: 0,
        otherExpenses: 0,
      },
      avgProductionVolume: 0,
      avgBatches: 0,
      productionUnit: 'items',
      targetProfitMargin: 0.2,
      overheadPerUnit: 0,
    }));
  };

  const calculateUnitPrice = (price, amount, unit) => {
    const pricePerUnit = price / amount;
    switch(unit.toLowerCase()) {
      case 'lb': return pricePerUnit / 16;
      case 'oz': return pricePerUnit;
      case 'count': return pricePerUnit;
      case 'cup': return pricePerUnit / 8;
      case 'tbsp': return pricePerUnit / 0.5;
      case 'tsp': return pricePerUnit / (1/6);
      default: return pricePerUnit;
    }
  };

  const handleOverheadCalculation = (values) => {
    dispatch(setOverheadValues(values));
    dispatch(calculateOverheadPerUnit());
  };

  const addNewIngredient = () => {
    if (newIngredient.name && newIngredient.price && newIngredient.amount && newIngredient.unit) {
      const unitPrice = calculateUnitPrice(
        parseFloat(newIngredient.price),
        parseFloat(newIngredient.amount),
        newIngredient.unit
      );
      dispatch(addIngredient({...newIngredient, unitPrice}));
      setNewIngredient({ name: '', price: '', amount: '', unit: '' });
    }
  };

  const updateIngredientHandler = (index, field, value) => {
    const updatedIngredient = {...ingredients[index], [field]: value};
    updatedIngredient.unitPrice = calculateUnitPrice(
      updatedIngredient.price,
      updatedIngredient.amount,
      updatedIngredient.unit
    );
    dispatch(updateIngredient(updatedIngredient));
  };

  const addNewRecipeIngredient = () => {
    if (newRecipeIngredient.ingredient && newRecipeIngredient.amount && newRecipeIngredient.unit) {
      if (editingRecipeIndex !== null && editingIngredientIndex !== null) {
        // Editing existing ingredient
        dispatch(updateIngredientInRecipe({
          recipeIndex: editingRecipeIndex,
          ingredientIndex: editingIngredientIndex,
          updatedIngredient: newRecipeIngredient
        }));
        setEditingIngredientIndex(null);
      } else if (editingRecipeIndex !== null) {
        // Adding new ingredient to existing recipe
        dispatch(addIngredientToRecipe({
          recipeIndex: editingRecipeIndex,
          ingredient: newRecipeIngredient
        }));
      } else {
        // Adding ingredient to new recipe
        setNewRecipe({
          ...newRecipe,
          ingredients: [...newRecipe.ingredients, newRecipeIngredient]
        });
      }
      setNewRecipeIngredient({ ingredient: '', amount: '', unit: '' });
    }
  };

  const addNewRecipe = () => {
    if (newRecipe.name && newRecipe.ingredients.length > 0) {
      if (editingRecipeIndex !== null) {
        dispatch(updateRecipe({
          index: editingRecipeIndex,
          recipe: newRecipe
        }));
        setEditingRecipeIndex(null);
      } else {
        dispatch(addRecipe(newRecipe));
      }
      setNewRecipe({ name: '', ingredients: [], batchSize: 1 });
    }
  };

  const startEditingRecipe = (index) => {
    setEditingRecipeIndex(index);
    setEditingIngredientIndex(null);
    setNewRecipe({...recipes[index]});
    setNewRecipeIngredient({ ingredient: '', amount: '', unit: '' });
  };

  const cancelEditingRecipe = () => {
    setEditingRecipeIndex(null);
    setNewRecipe({ name: '', ingredients: [], batchSize: 1 });
  };

  const calculateRecipeCost = (recipe) => {
    if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      return { totalCost: 0, costPerItem: 0 };
    }
  
    const ingredientCost = recipe.ingredients.reduce((total, recipeIngredient) => {
      const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
      if (!ingredient) return total;
      const amount = convertToOz(parseFloat(recipeIngredient.amount), recipeIngredient.unit);
      return total + (amount * ingredient.unitPrice);
    }, 0);
  
    const totalCost = ingredientCost + overheadValues.overheadPerUnit;
    const costPerItem = totalCost / (recipe.batchSize || 1);
    return { totalCost, costPerItem };
  };

  const calculateSuggestedRetailPrice = (recipeCost) => {
    const profitMargin = overheadValues.targetProfitMargin;
    
    if (profitMargin >= 1 || profitMargin < 0) {
      console.error('Invalid profit margin:', profitMargin);
      return recipeCost;
    }
    
    return recipeCost / (1 - profitMargin);
  };

  const cancelEditingIngredient = () => {
    setEditingIngredientIndex(null);
    setNewRecipeIngredient({ ingredient: '', amount: '', unit: '' });
  };

  const convertToOz = (amount, unit) => {
    switch(unit.toLowerCase()) {
      case 'lb': return amount * 16;
      case 'oz': return amount;
      case 'cup': return amount * 8;
      case 'tbsp': return amount * 0.5;
      case 'tsp': return amount / 6;
      default: return amount;
    }
  };

  const removeIngredientFromRecipe = (recipeIndex, ingredientIndex) => {
    dispatch(removeIngredientFromRecipe({ recipeIndex, ingredientIndex }));
  };

  const editIngredientInRecipe = (recipeIndex, ingredientIndex, updatedIngredient) => {
    dispatch(updateIngredientInRecipe({ recipeIndex, ingredientIndex, updatedIngredient }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Ingredient and Recipe Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        {!currentUser ? (
          <div className="space-y-4 mb-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin}>Login</Button>
            <Button onClick={handleCreateAccount}>Create Account</Button>
          </div>
        ) : (
          <div className="mb-4">
            <p>Logged in as: {currentUser}</p>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        )}
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <Dashboard ingredients={ingredients} recipes={recipes} />
          </TabsContent>
          <TabsContent value="ingredients">
            <div className="grid grid-cols-5 gap-2 mb-2 font-bold">
              <Label>Name</Label>
              <Label>Price ($)</Label>
              <Label>Amount</Label>
              <Label>Unit</Label>
              <Label>Unit Price ($/oz)</Label>
            </div>
            <ScrollArea className="h-[400px] pr-4 mb-6">
              <div className="space-y-4">
                {Array.isArray(ingredients) && ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <Input 
                      value={ingredient.name} 
                      onChange={(e) => updateIngredientHandler(index, 'name', e.target.value)}
                    />
                    <Input 
                      type="number" 
                      value={ingredient.price} 
                      onChange={(e) => updateIngredientHandler(index, 'price', parseFloat(e.target.value))}
                    />
                    <Input 
                      type="number" 
                      value={ingredient.amount} 
                      onChange={(e) => updateIngredientHandler(index, 'amount', parseFloat(e.target.value))}
                    />
                    <Select 
                      value={ingredient.unit} 
                      onChange={(value) => updateIngredientHandler(index, 'unit', value)}
                      placeholder="Select unit"
                    >
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </Select>
                    <Input value={ingredient.unitPrice.toFixed(4)} readOnly />
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="grid grid-cols-5 gap-2">
              <Input 
                placeholder="Name" 
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Price" 
                value={newIngredient.price}
                onChange={(e) => setNewIngredient({...newIngredient, price: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Amount" 
                value={newIngredient.amount}
                onChange={(e) => setNewIngredient({...newIngredient, amount: e.target.value})}
              />
              <Select 
                value={newIngredient.unit} 
                onChange={(value) => setNewIngredient({...newIngredient, unit: value})}
                placeholder="Select unit"
              >
                {units.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </Select>
              <Button onClick={addNewIngredient}>Add</Button>
            </div>
          </TabsContent>
          <TabsContent value="recipes">
            <ScrollArea className="h-[300px] pr-4 mb-6">
              {recipes.map((recipe, recipeIndex) => (
                <div key={recipeIndex} className="mb-4">
                  <h4 className="font-semibold">{recipe.name} (Batch Size: {recipe.batchSize || 1})</h4>
                  <p>Ingredient Cost: ${(calculateRecipeCost(recipe).totalCost - overheadValues.overheadPerUnit).toFixed(2)}</p>
                  <p>Total Cost (with overhead): ${calculateRecipeCost(recipe).totalCost.toFixed(2)}</p>
                  <p>Cost per Item: ${calculateRecipeCost(recipe).costPerItem.toFixed(2)}</p>
                  <p>Suggested Retail Price: ${calculateSuggestedRetailPrice(calculateRecipeCost(recipe).totalCost).toFixed(2)}</p>
                  <ul>
                    {recipe.ingredients.map((ingredient, ingredientIndex) => (
                      <li key={ingredientIndex} className="flex items-center justify-between">
                        <span>{ingredient.amount} {ingredient.unit} {ingredient.ingredient}</span>
                        <div>
                          <Button onClick={() => {
                            setNewRecipeIngredient(ingredient);
                            setEditingRecipeIndex(recipeIndex);
                            setEditingIngredientIndex(ingredientIndex);
                          }} className="mr-2">Edit</Button>
                          <Button onClick={() => removeIngredientFromRecipe(recipeIndex, ingredientIndex)}>Remove</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => startEditingRecipe(recipeIndex)}>Edit Recipe</Button>
                </div>
              ))}
            </ScrollArea>
            <div className="space-y-4">
              <Input 
                placeholder="Recipe Name" 
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
              />
              <Input 
                type="number"
                placeholder="Batch Size"
                value={newRecipe.batchSize}
                onChange={(e) => setNewRecipe({...newRecipe, batchSize: parseInt(e.target.value) || 1})}
              />
              <div className="grid grid-cols-4 gap-2">
                <Select 
                  value={newRecipeIngredient.ingredient}
                  onChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, ingredient: value})}
                  placeholder="Select ingredient"
                >
                  {ingredients.map(ing => (
                    <SelectItem key={ing.name} value={ing.name}>{ing.name}</SelectItem>
                  ))}
                </Select>
                <Input 
                  type="number"
                  placeholder="Amount"
                  value={newRecipeIngredient.amount}
                  onChange={(e) => setNewRecipeIngredient({...newRecipeIngredient, amount: e.target.value})}
                />
                <Select 
                  value={newRecipeIngredient.unit}
                  onChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, unit: value})}
                  placeholder="Select unit"
                >
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </Select>
                <Button onClick={addNewRecipeIngredient}>
                  {editingIngredientIndex !== null ? 'Update Ingredient' : 'Add Ingredient'}
                </Button>
              </div>
              {editingIngredientIndex !== null && (
                <Button onClick={cancelEditingIngredient}>Cancel Editing Ingredient</Button>
              )}
              {newRecipe.ingredients.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Current Recipe: {newRecipe.name}</h4>
                  <p>Batch Size: {newRecipe.batchSize || 1}</p>
                  <p>Estimated Cost: ${calculateRecipeCost(newRecipe).totalCost.toFixed(2)}</p>
                  <p>Cost per Item: ${calculateRecipeCost(newRecipe).costPerItem.toFixed(2)}</p>
                  <ul>
                    {newRecipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>{ingredient.amount} {ingredient.unit} {ingredient.ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-between">
                <Button onClick={addNewRecipe}>
                  {editingRecipeIndex !== null ? 'Update Recipe' : 'Save Recipe'}
                </Button>
                {editingRecipeIndex !== null && (
                  <Button onClick={cancelEditingRecipe}>Cancel Editing Recipe</Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IngredientRecipeCalculator;
