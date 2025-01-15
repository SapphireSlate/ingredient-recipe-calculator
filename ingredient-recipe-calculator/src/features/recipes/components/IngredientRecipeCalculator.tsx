import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createAccount, login, logout, getCurrentUser, saveUserData, getUserData } from '@/utils/auth';
import { OverheadCalculator } from '@/features/overhead/components/OverheadCalculator';
import { convertToOz } from '@/shared/utils/conversion';
import { RecipeManagement } from './RecipeManagement';
import { ProductionPlanning } from '@/features/production/components/ProductionPlanning';

import { Ingredient, NewIngredient, Unit, Category } from '@/features/ingredients/types';
import { Recipe, NewRecipe, RecipeIngredient, NewRecipeIngredient } from '../types';
import type { User, UserData } from '@/shared/types/user';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { v4 as uuidv4 } from 'uuid';

const IngredientRecipeCalculator: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: '',
    price: '',
    amount: '',
    unit: 'lb',
    category: 'Other'
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [overheadCost, setOverheadCost] = useState(0);
  const [editingIngredient, setEditingIngredient] = useState<{ index: number; ingredient: Ingredient } | null>(null);
  const [error, setError] = useState<string>('');

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const data = await getUserData();
          if (data) {
            setIngredients(data.ingredients || []);
            setRecipes(data.recipes || []);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkExistingSession();
  }, []);

  const handleCreateAccount = async (): Promise<void> => {
    try {
      const user = await createAccount(username, password);
      setCurrentUser(user);
      // Clear the form
      setUsername('');
      setPassword('');
      // No need to call login since createAccount now logs in automatically
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleLogin = async (): Promise<void> => {
    try {
      await login(username, password);
      const user = await getCurrentUser();
      setCurrentUser(user);
      const userData = await getUserData();
      if (userData) {
        setIngredients(userData.ingredients || []);
        setRecipes(userData.recipes || []);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setCurrentUser(null);
      setIngredients([]);
      setRecipes([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const calculateUnitPrice = (price: number, amount: number, unit: Unit): number => {
    const ozAmount = convertToOz(amount, unit);
    return ozAmount > 0 ? price / ozAmount : 0;
  };

  const handleEditIngredient = (index: number, ingredient: Ingredient) => {
    setEditingIngredient({ index, ingredient });
    setNewIngredient({
      name: ingredient.name,
      price: ingredient.price.toString(),
      amount: ingredient.amount.toString(),
      unit: ingredient.unit,
      category: ingredient.category
    });
  };

  const validateIngredient = (ingredient: NewIngredient): { isValid: boolean; error?: string } => {
    // Check for empty name
    if (ingredient.name.trim() === '') {
      return { isValid: false, error: 'Ingredient name is required' };
    }

    // Check for duplicate ingredient name
    const isDuplicateName = ingredients.some(
      existing => existing.name.toLowerCase() === ingredient.name.trim().toLowerCase()
    );
    if (isDuplicateName) {
      return { isValid: false, error: 'An ingredient with this name already exists' };
    }

    // Check for valid numbers
    if (parseFloat(ingredient.price) <= 0) {
      return { isValid: false, error: 'Price must be greater than 0' };
    }
    if (parseFloat(ingredient.amount) <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    return { isValid: true };
  };

  const handleDeleteIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    const validation = validateIngredient(newIngredient);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid ingredient');
      return;
    }

    const unitPrice = calculateUnitPrice(
      parseFloat(newIngredient.price),
      parseFloat(newIngredient.amount),
      newIngredient.unit
    );

    const id = uuidv4();
    const ingredient: Ingredient = {
      id,
      name: newIngredient.name.trim(),
      price: newIngredient.price,
      amount: newIngredient.amount,
      unit: newIngredient.unit,
      category: newIngredient.category,
      unitPrice,
    };

    if (editingIngredient) {
      const newIngredients = [...ingredients];
      newIngredients[editingIngredient.index] = ingredient;
      setIngredients(newIngredients);
      setEditingIngredient(null);
    } else {
      setIngredients(prev => [...prev, ingredient]);
    }

    setNewIngredient({
      name: '',
      price: '',
      amount: '',
      unit: 'lb',
      category: 'Other'
    });
    setError('');
  };

  const handleUpdateIngredient = (index: number, updatedPrice: string) => {
    const newIngredients = [...ingredients];
    const ingredient = newIngredients[index];
    
    const newUnitPrice = calculateUnitPrice(
      parseFloat(updatedPrice),
      parseFloat(ingredient.amount),
      ingredient.unit
    );

    // Update ingredient
    newIngredients[index] = {
      ...ingredient,
      price: updatedPrice,
      unitPrice: newUnitPrice,
    };

    setIngredients(newIngredients);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setRecipes([...recipes, recipe]);
  };

  const handleUpdateRecipe = (index: number, recipe: Recipe) => {
    const newRecipes = [...recipes];
    newRecipes[index] = recipe;
    setRecipes(newRecipes);
  };

  const handleDeleteRecipe = (index: number) => {
    const newRecipes = [...recipes];
    newRecipes.splice(index, 1);
    setRecipes(newRecipes);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, recipeIngredient) => {
      const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
      if (!ingredient) return total;
      return total + (ingredient.unitPrice * recipeIngredient.amount);
    }, 0);
  };

  // Save data to backend/localStorage
  useEffect(() => {
    if (currentUser) {
      saveUserData({
        ingredients,
        recipes
      });
    }
  }, [ingredients, recipes, currentUser]);

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Recipe Cost Calculator</h1>
        {currentUser && (
          <div className="flex items-center space-x-4">
            <p className="text-sm">Logged in as: {currentUser.username}</p>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        )}
      </div>
      
      {!currentUser ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Login or Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleLogin} className="w-full sm:w-auto">Login</Button>
                <Button variant="outline" onClick={handleCreateAccount} className="w-full sm:w-auto">Create Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="ingredients">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="overhead">Overhead</TabsTrigger>
              <TabsTrigger value="production">Production Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {error && (
                      <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          autoComplete="off"
                          value={newIngredient.name}
                          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                          placeholder="Ingredient name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          autoComplete="off"
                          value={newIngredient.price}
                          onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })}
                          placeholder="Price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          autoComplete="off"
                          value={newIngredient.amount}
                          onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <select
                          id="unit"
                          name="unit"
                          autoComplete="off"
                          value={newIngredient.unit}
                          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as Unit })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="lb">Pounds (lb)</option>
                          <option value="oz">Ounces (oz)</option>
                          <option value="g">Grams (g)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="cup">Cups</option>
                          <option value="tbsp">Tablespoons</option>
                          <option value="tsp">Teaspoons</option>
                          <option value="ml">Milliliters</option>
                          <option value="l">Liters</option>
                          <option value="piece">Pieces</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          autoComplete="off"
                          value={newIngredient.category}
                          onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value as Category })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Produce">Produce</option>
                          <option value="Meat">Meat</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Dry Goods">Dry Goods</option>
                          <option value="Spices">Spices</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddIngredient} className="w-full">
                          {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <ScrollArea className="h-[300px]">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Price ($)</th>
                              <th className="text-left p-2">Amount</th>
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Category</th>
                              <th className="text-left p-2">Unit Price ($/oz)</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredients.map((ingredient, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{ingredient.name}</td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    value={ingredient.price}
                                    onChange={(e) => handleUpdateIngredient(index, e.target.value)}
                                    className="w-24"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="p-2">{ingredient.amount}</td>
                                <td className="p-2">{ingredient.unit}</td>
                                <td className="p-2">{ingredient.category}</td>
                                <td className="p-2">${ingredient.unitPrice.toFixed(2)}</td>
                                <td className="p-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteIngredient(index)}
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes">
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecipeManagement
                    recipes={recipes}
                    ingredients={ingredients}
                    onAddRecipe={handleAddRecipe}
                    onUpdateRecipe={handleUpdateRecipe}
                    onDeleteRecipe={handleDeleteRecipe}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overhead">
              <OverheadCalculator 
                onOverheadCostChange={setOverheadCost}
                recipes={recipes}
                calculateRecipeCost={calculateRecipeCost}
              />
            </TabsContent>

            <TabsContent value="production">
              <ProductionPlanning 
                recipes={recipes}
                ingredients={ingredients}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      <ThemeToggle />
    </div>
  );
};

export default IngredientRecipeCalculator; 