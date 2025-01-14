import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Select, SelectItem } from "@components/ui/select";
import { ScrollArea } from "@components/ui/scroll-area";
import { Label } from "@components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { createAccount, login, logout, getCurrentUser, saveUserData, getUserData } from '@utils/auth';
import { OverheadCalculator } from '@features/overhead/components/OverheadCalculator';
import { convertToOz } from '@utils/conversion';
import { RecipeManagement } from './RecipeManagement';

import { Ingredient, NewIngredient, Unit, Category } from '@features/ingredients/types';
import { Recipe, NewRecipe, RecipeIngredient, NewRecipeIngredient } from '../types';
import type { User } from '@shared/types/user';
import { ThemeToggle } from '@components/ui/theme-toggle';

const IngredientRecipeCalculator: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: 'All Purpose Flour', price: 5.00, amount: 5, unit: 'lb', unitPrice: 0.0625, category: 'Dry Goods' },
    { name: 'Granulated Sugar', price: 4.00, amount: 4, unit: 'lb', unitPrice: 0.0625, category: 'Dry Goods' },
    // ... rest of the initial ingredients
  ]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({ name: '', price: '', amount: '', unit: 'lb' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [overheadCost, setOverheadCost] = useState(0);
  const [editingIngredient, setEditingIngredient] = useState<{ index: number; ingredient: Ingredient } | null>(null);

  const handleCreateAccount = async (): Promise<void> => {
    try {
      await createAccount(username, password);
      // Handle successful account creation
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleLogin = async (): Promise<void> => {
    try {
      await login(username, password);
      const user = await getCurrentUser();
      setCurrentUser(user);
      // Load user data
      const userData = await getUserData();
      if (userData) {
        setIngredients(userData.ingredients);
        setRecipes(userData.recipes);
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
    });
  };

  const addNewIngredient = (): void => {
    if (newIngredient.name && newIngredient.price && newIngredient.amount && newIngredient.unit) {
      const price = Number(newIngredient.price);
      const amount = Number(newIngredient.amount);
      const unitPrice = calculateUnitPrice(price, amount, newIngredient.unit);
      
      const ingredient: Ingredient = {
        name: newIngredient.name,
        price,
        amount,
        unit: newIngredient.unit,
        unitPrice,
        category: editingIngredient?.ingredient.category || 'Dry Goods'
      };
      
      if (editingIngredient) {
        const newIngredients = [...ingredients];
        newIngredients[editingIngredient.index] = ingredient;
        setIngredients(newIngredients);
        setEditingIngredient(null);
      } else {
        setIngredients([...ingredients, ingredient]);
      }
      
      setNewIngredient({ name: '', price: '', amount: '', unit: 'lb' });
    }
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
            </TabsList>

            <TabsContent value="ingredients">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newIngredient.name}
                          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                          placeholder="Ingredient name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newIngredient.price}
                          onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })}
                          placeholder="Price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newIngredient.amount}
                          onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                          placeholder="Amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={newIngredient.unit}
                          onValueChange={(value) => setNewIngredient({ ...newIngredient, unit: value as Unit })}
                        >
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addNewIngredient} className="w-full">
                          {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <ScrollArea className="h-[400px]">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Price</th>
                              <th className="text-left p-2">Amount</th>
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Unit Price</th>
                              <th className="text-left p-2">Category</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredients.map((ingredient, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{ingredient.name}</td>
                                <td className="p-2">${ingredient.price.toFixed(2)}</td>
                                <td className="p-2">{ingredient.amount}</td>
                                <td className="p-2">{ingredient.unit}</td>
                                <td className="p-2">${ingredient.unitPrice.toFixed(4)}/oz</td>
                                <td className="p-2">{ingredient.category}</td>
                                <td className="p-2 space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditIngredient(index, ingredient)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newIngredients = [...ingredients];
                                      newIngredients.splice(index, 1);
                                      setIngredients(newIngredients);
                                    }}
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
          </Tabs>
        </>
      )}
      <ThemeToggle />
    </div>
  );
};

export default IngredientRecipeCalculator; 