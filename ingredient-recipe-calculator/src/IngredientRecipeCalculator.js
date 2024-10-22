import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { ScrollArea } from "./components/ui/scroll-area";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { createAccount, login, logout, getCurrentUser, saveUserData, getUserData } from './utils/auth';
import OverheadCalculator from './OverheadCalculator';

const IngredientRecipeCalculator = () => {
  const [ingredients, setIngredients] = useState([
    { name: 'All Purpose Flour', price: 5.00, amount: 5, unit: 'lb', unitPrice: 0.0625, category: 'Dry Goods' },
    { name: 'Granulated Sugar', price: 4.00, amount: 4, unit: 'lb', unitPrice: 0.0625, category: 'Dry Goods' },
    { name: 'Brown Sugar', price: 4.50, amount: 4, unit: 'lb', unitPrice: 0.0703, category: 'Dry Goods' },
    { name: 'Powdered Sugar', price: 3.50, amount: 2, unit: 'lb', unitPrice: 0.1094, category: 'Dry Goods' },
    { name: 'Cake Flour', price: 3.50, amount: 2, unit: 'lb', unitPrice: 0.1094, category: 'Dry Goods' },
    { name: 'Butter', price: 3.50, amount: 1, unit: 'lb', unitPrice: 0.2188, category: 'Dairy' },
    { name: 'Eggs', price: 3.00, amount: 12, unit: 'count', unitPrice: 0.25, category: 'Dairy' },
    { name: 'Cream Cheese', price: 2.50, amount: 8, unit: 'oz', unitPrice: 0.3125, category: 'Dairy' },
    { name: 'Heavy Whipping Cream', price: 3.50, amount: 16, unit: 'oz', unitPrice: 0.2188, category: 'Dairy' },
    { name: 'Sour Cream', price: 2.00, amount: 16, unit: 'oz', unitPrice: 0.125, category: 'Dairy' },
    { name: 'Milk', price: 3.50, amount: 128, unit: 'oz', unitPrice: 0.0273, category: 'Dairy' },
    { name: 'Buttermilk', price: 2.50, amount: 32, unit: 'oz', unitPrice: 0.0781, category: 'Dairy' },
    { name: 'Vanilla Extract', price: 6.50, amount: 4, unit: 'oz', unitPrice: 1.625, category: 'Flavorings' },
    { name: 'Almond Extract', price: 4.50, amount: 2, unit: 'oz', unitPrice: 2.25, category: 'Flavorings' },
    { name: 'Lemon Extract', price: 4.00, amount: 2, unit: 'oz', unitPrice: 2, category: 'Flavorings' },
    { name: 'Vegetable Oil', price: 3.00, amount: 48, unit: 'oz', unitPrice: 0.0625, category: 'Oils' },
    { name: 'Canola Oil', price: 3.50, amount: 48, unit: 'oz', unitPrice: 0.0729, category: 'Oils' },
    { name: 'Cocoa Powder', price: 3.50, amount: 8, unit: 'oz', unitPrice: 0.4375, category: 'Dry Goods' },
    { name: 'Baking Powder', price: 2.50, amount: 8, unit: 'oz', unitPrice: 0.3125, category: 'Dry Goods' },
    { name: 'Baking Soda', price: 1.00, amount: 16, unit: 'oz', unitPrice: 0.0625, category: 'Dry Goods' },
    { name: 'Salt', price: 1.00, amount: 26, unit: 'oz', unitPrice: 0.0385, category: 'Dry Goods' },
    { name: 'Chocolate Chips', price: 3.50, amount: 12, unit: 'oz', unitPrice: 0.2917, category: 'Add-ins' },
    { name: 'Nuts (Assorted)', price: 6.00, amount: 16, unit: 'oz', unitPrice: 0.375, category: 'Add-ins' },
    { name: 'Cream of Tartar', price: 3.00, amount: 3, unit: 'oz', unitPrice: 1, category: 'Dry Goods' },
    { name: 'Cornstarch', price: 2.00, amount: 16, unit: 'oz', unitPrice: 0.125, category: 'Dry Goods' },
    { name: 'Yeast', price: 2.00, amount: 4, unit: 'oz', unitPrice: 1, category: 'Dry Goods' },
  ]);

  const [recipes, setRecipes] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', price: '', amount: '', unit: '' });
  const [newRecipe, setNewRecipe] = useState({ name: '', ingredients: [], yield: 1, monthlySales: 0 });
  const [newRecipeIngredient, setNewRecipeIngredient] = useState({ ingredient: '', amount: '', unit: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingRecipeIndex, setEditingRecipeIndex] = useState(null);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [overheadData, setOverheadData] = useState({
    rent: 0,
    utilities: 0,
    payroll: 0,
    otherExpenses: 0,
    profitPercentage: 20
  });

  const units = ['oz', 'lb', 'cup', 'tbsp', 'tsp', 'count'];

  useEffect(() => {
    const loggedInUser = getCurrentUser();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      const userData = getUserData(loggedInUser);
      setIngredients(prevIngredients => userData.ingredients || prevIngredients);
      setRecipes(userData.recipes || []);
      setOverheadData(userData.overheadData || overheadData);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      saveUserData(currentUser, ingredients, recipes, overheadData);
    }
  }, [currentUser, ingredients, recipes, overheadData]);

  const handleCreateAccount = () => {
    const result = createAccount(username, password);
    if (result.success) {
      setCurrentUser(username);
      setIngredients(ingredients);
      setRecipes([]);
    } else {
      alert(result.message);
    }
  };

  const handleLogin = () => {
    const result = login(username, password);
    if (result.success) {
      setCurrentUser(username);
      const userData = getUserData(username);
      setIngredients(userData.ingredients || ingredients);
      setRecipes(userData.recipes || []);
    } else {
      alert(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIngredients([
      { name: 'All Purpose Flour', price: 5.00, amount: 5, unit: 'lb', unitPrice: 0.0625, category: 'Dry Goods' },
      // ... (rest of your initial ingredients)
    ]);
    setRecipes([]);
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

const addNewIngredient = () => {
  if (newIngredient.name && newIngredient.price && newIngredient.amount && newIngredient.unit) {
    const unitPrice = calculateUnitPrice(
      parseFloat(newIngredient.price),
      parseFloat(newIngredient.amount),
      newIngredient.unit
    );
    setIngredients([...ingredients, {...newIngredient, unitPrice}]);
    setNewIngredient({ name: '', price: '', amount: '', unit: '' });
  }
};

const updateIngredient = (index, field, value) => {
  const updatedIngredients = [...ingredients];
  updatedIngredients[index][field] = value;
  updatedIngredients[index].unitPrice = calculateUnitPrice(
    updatedIngredients[index].price,
    updatedIngredients[index].amount,
    updatedIngredients[index].unit
  );
  setIngredients(updatedIngredients);
};

const addNewRecipeIngredient = () => {
  if (newRecipeIngredient.ingredient && newRecipeIngredient.amount && newRecipeIngredient.unit) {
    if (editingRecipeIndex !== null && editingIngredientIndex !== null) {
      // Editing existing ingredient
      editIngredientInRecipe(editingRecipeIndex, editingIngredientIndex, newRecipeIngredient);
      setEditingIngredientIndex(null);
    } else if (editingRecipeIndex !== null) {
      // Adding new ingredient to existing recipe
      const updatedRecipes = [...recipes];
      updatedRecipes[editingRecipeIndex].ingredients.push(newRecipeIngredient);
      setRecipes(updatedRecipes);
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
    const recipeWithCost = {
      ...newRecipe,
      cost: calculateRecipeCost(newRecipe),
      yield: parseFloat(newRecipe.yield) || 1,
      monthlySales: parseInt(newRecipe.monthlySales) || 0
    };
    if (editingRecipeIndex !== null) {
      const updatedRecipes = [...recipes];
      updatedRecipes[editingRecipeIndex] = recipeWithCost;
      setRecipes(updatedRecipes);
      setEditingRecipeIndex(null);
    } else {
      setRecipes([...recipes, recipeWithCost]);
    }
    setNewRecipe({ name: '', ingredients: [], yield: 1, monthlySales: 0 });
  }
};

const startEditingRecipe = (index) => {
  setEditingRecipeIndex(index);
  setEditingIngredientIndex(null);
  setNewRecipe({...recipes[index]});
  setNewRecipeIngredient({ ingredient: '', amount: ''});
};

const cancelEditingRecipe = () => {
  setEditingRecipeIndex(null);
  setNewRecipe({ name: '', ingredients: [], yield: 1, monthlySales: 0 });
};

const calculateRecipeCost = (recipe) => {
  const cost = recipe.ingredients.reduce((total, recipeIngredient) => {
    const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
    if (!ingredient) return total;
    const amount = convertToOz(parseFloat(recipeIngredient.amount), recipeIngredient.unit);
    return total + (amount * ingredient.unitPrice);
  }, 0);
  return cost;
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
  const updatedRecipes = [...recipes];
  updatedRecipes[recipeIndex].ingredients.splice(ingredientIndex, 1);
  setRecipes(updatedRecipes);
};

const editIngredientInRecipe = (recipeIndex, ingredientIndex, updatedIngredient) => {
  const updatedRecipes = [...recipes];
  updatedRecipes[recipeIndex].ingredients[ingredientIndex] = updatedIngredient;
  setRecipes(updatedRecipes);
};

const updateRecipe = (index, updatedRecipe) => {
  const newRecipes = [...recipes];
  newRecipes[index] = updatedRecipe;
  setRecipes(newRecipes);
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
      <Tabs defaultValue="ingredients">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="overhead">Overhead</TabsTrigger>
        </TabsList>
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
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-5 gap-2">
                  <Input 
                    value={ingredient.name} 
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  />
                  <Input 
                    type="number" 
                    value={ingredient.price} 
                    onChange={(e) => updateIngredient(index, 'price', parseFloat(e.target.value))}
                  />
                  <Input 
                    type="number" 
                    value={ingredient.amount} 
                    onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value))}
                  />
                  <Select 
                    value={ingredient.unit} 
                    onValueChange={(value) => updateIngredient(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="select-content">
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit} className="select-item">{unit}</SelectItem>
                      ))}
                    </SelectContent>
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
              onValueChange={(value) => setNewIngredient({...newIngredient, unit: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent className="select-content">
                {units.map(unit => (
                  <SelectItem key={unit} value={unit} className="select-item">{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addNewIngredient}>Add</Button>
          </div>
        </TabsContent>
        <TabsContent value="recipes">
          <ScrollArea className="h-[300px] pr-4 mb-6">
            {recipes.map((recipe, recipeIndex) => (
              <div key={recipeIndex} className="mb-4">
                <h4 className="font-semibold">{recipe.name}</h4>
                <p>Cost: ${recipe.cost.toFixed(2)}</p>
                <p>Yield: {recipe.yield} servings</p>
                <p>Monthly Sales: {recipe.monthlySales} units</p>
                {recipe.suggestedPrice && <p>Suggested Price: ${recipe.suggestedPrice}</p>}
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
            <div className="grid grid-cols-4 gap-2">
              <Select 
                value={newRecipeIngredient.ingredient}
                onValueChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, ingredient: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ingredient" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {ingredients.map(ing => (
                    <SelectItem key={ing.name} value={ing.name} className="select-item">{ing.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="number"
                placeholder="Amount"
                value={newRecipeIngredient.amount}
                onChange={(e) => setNewRecipeIngredient({...newRecipeIngredient, amount: e.target.value})}
              />
              <Select 
                value={newRecipeIngredient.unit}
                onValueChange={(value) => setNewRecipeIngredient({...newRecipeIngredient, unit: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit} className="select-item">{unit}</SelectItem>
                  ))}
                </SelectContent>
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
                <p>Estimated Cost: ${calculateRecipeCost(newRecipe).toFixed(2)}</p>
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
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <Label htmlFor="recipeYield">Recipe Yield</Label>
                <Input
                  id="recipeYield"
                  type="number"
                  value={newRecipe.yield}
                  onChange={(e) => setNewRecipe({...newRecipe, yield: e.target.value})}
                  placeholder="Number of servings"
                />
              </div>
              <div>
                <Label htmlFor="monthlySales">Estimated Monthly Sales</Label>
                <Input
                  id="monthlySales"
                  type="number"
                  value={newRecipe.monthlySales}
                  onChange={(e) => setNewRecipe({...newRecipe, monthlySales: e.target.value})}
                  placeholder="Units sold per month"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="overhead">
          <OverheadCalculator 
            recipes={recipes} 
            updateRecipe={updateRecipe}
            overheadData={overheadData}
            setOverheadData={setOverheadData}
          />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);
};

export default IngredientRecipeCalculator;
