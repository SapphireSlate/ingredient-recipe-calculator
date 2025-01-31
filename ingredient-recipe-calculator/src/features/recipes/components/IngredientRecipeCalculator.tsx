import React, { useState, useEffect, SetStateAction } from 'react';
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
import * as XLSX from 'xlsx';
import { DuplicateIngredientsDialog } from '@/components/ui/DuplicateIngredientsDialog';
import { HelpDialog } from '@/components/ui/help-dialog';

interface ImportRow {
  [key: string]: unknown;
  __rowNum__?: number;
}

const IngredientRecipeCalculator: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: '',
    price: '',
    amount: '',
    unit: Unit.LB,
    category: 'Other'
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [overheadCost, setOverheadCost] = useState(0);
  const [editingIngredient, setEditingIngredient] = useState<{ index: number; ingredient: Ingredient } | null>(null);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Ingredient | null>(null);
  const [duplicates, setDuplicates] = useState<{ existing: Ingredient; new: Ingredient }[]>([]);
  const [pendingIngredients, setPendingIngredients] = useState<Ingredient[]>([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);

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

  const handleCreateAccount = async () => {
    try {
      await createAccount(username, password);
      const user = await getCurrentUser();
      setCurrentUser(user);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
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

  const handleUpdateIngredient = () => {
    if (!editingIngredient) return;

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

    const updatedIngredient: Ingredient = {
      id: editingIngredient.ingredient.id,
      name: newIngredient.name.trim(),
      price: newIngredient.price,
      amount: newIngredient.amount,
      unit: newIngredient.unit,
      category: newIngredient.category,
      unitPrice,
    };

    const newIngredients = [...ingredients];
    newIngredients[editingIngredient.index] = updatedIngredient;
    setIngredients(newIngredients);
    setEditingIngredient(null);
    
    // Reset the form
    setNewIngredient({
      name: '',
      price: '',
      amount: '',
      unit: Unit.LB,
      category: 'Other'
    });
    setError('');
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
      unit: Unit.LB,
      category: 'Other'
    });
    setError('');
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

  const handleImportIngredients = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];

        const errors: string[] = [];
        const newIngredients: Ingredient[] = [];
        const foundDuplicates: { existing: Ingredient; new: Ingredient }[] = [];

        for (const row of rows) {
          // Normalize column names
          const normalizedRow = Object.entries(row as Record<string, unknown>).reduce((acc, [key, value]) => {
            acc[key.toLowerCase()] = value;
            return acc;
          }, {} as Record<string, unknown>);

          // Basic validation
          if (!normalizedRow.name || typeof normalizedRow.name !== 'string' || !normalizedRow.name.trim()) {
            errors.push(`Missing name in row ${(row.__rowNum__ ?? 0) + 1}`);
            continue;
          }

          const price = Number(normalizedRow.price);
          if (isNaN(price) || price <= 0) {
            errors.push(`Invalid price for ${normalizedRow.name}`);
            continue;
          }

          const amount = Number(normalizedRow.amount);
          if (isNaN(amount) || amount <= 0) {
            errors.push(`Invalid amount for ${normalizedRow.name}`);
            continue;
          }

          const unitValue = String(normalizedRow.unit ?? '').toLowerCase();
          const validUnits = Object.values(Unit).map(u => u.toLowerCase());
          if (!unitValue || !validUnits.includes(unitValue)) {
            errors.push(`Invalid unit for ${normalizedRow.name}. Must be one of: ${Object.values(Unit).join(', ')}`);
            continue;
          }

          const unit = Object.values(Unit).find(u => u.toLowerCase() === unitValue);
          if (!unit) {
            errors.push(`Invalid unit for ${normalizedRow.name}`);
            continue;
          }

          const unitPrice = calculateUnitPrice(price, amount, unit);

          const newIngredient: Ingredient = {
            id: uuidv4(),
            name: String(normalizedRow.name).trim(),
            price: price.toString(),
            amount: amount.toString(),
            unit,
            category: (normalizedRow.category && typeof normalizedRow.category === 'string' 
              ? normalizedRow.category 
              : 'Other') as Category,
            unitPrice,
          };

          // Check for duplicates
          const existingIngredient = ingredients.find(
            ing => ing.name.toLowerCase() === newIngredient.name.toLowerCase()
          );

          if (existingIngredient) {
            foundDuplicates.push({
              existing: existingIngredient,
              new: newIngredient
            });
          } else {
            newIngredients.push(newIngredient);
          }
        }

        if (errors.length > 0) {
          setError(`Import errors:\n${errors.join('\n')}`);
          return;
        }

        if (foundDuplicates.length > 0) {
          setDuplicates(foundDuplicates);
          setPendingIngredients(newIngredients);
          setShowDuplicatesDialog(true);
        } else {
          setIngredients(prev => [...prev, ...newIngredients]);
          setError('');
        }

        event.target.value = ''; // Reset file input
      } catch (err) {
        setError('Failed to import file. Please make sure it is a valid Excel file with the correct format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDuplicateResolution = (resolvedDuplicates: { existing: Ingredient; new: Ingredient; action: 'keep' | 'replace' | undefined }[]) => {
    const updatedIngredients = [...ingredients];

    // Process resolved duplicates
    resolvedDuplicates.forEach(({ existing, new: newIng, action }) => {
      if (action === 'replace') {
        const index = updatedIngredients.findIndex(ing => ing.id === existing.id);
        if (index !== -1) {
          updatedIngredients[index] = newIng;
        }
      }
      // If action is 'keep', we do nothing as we're keeping the existing ingredient
    });

    // Add all pending ingredients that weren't duplicates
    setIngredients([...updatedIngredients, ...pendingIngredients]);
    
    // Reset state
    setDuplicates([]);
    setPendingIngredients([]);
    setShowDuplicatesDialog(false);
    setError('');
  };

  const handleExportIngredients = () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const exportData = ingredients.map(ing => ({
      'Name': ing.name,
      'Price': ing.price,
      'Amount': ing.amount,
      'Unit': ing.unit,
      'Category': ing.category,
      'Unit Price ($/oz)': ing.unitPrice.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingredients');
    XLSX.writeFile(workbook, `ingredients_${currentDate}.xlsx`);
  };

  const resetIngredientForm = () => {
    setNewIngredient({
      name: '',
      price: '',
      amount: '',
      unit: Unit.LB,
      category: 'Other'
    });
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditingValues(ingredient);
  };

  const handleInlineEdit = (field: keyof Ingredient, value: string) => {
    if (!editingValues) return;
    
    setEditingValues({
      ...editingValues,
      [field]: value,
    });
  };

  const saveInlineEdit = () => {
    if (!editingValues || !editingId) return;

    const unitPrice = calculateUnitPrice(
      parseFloat(editingValues.price),
      parseFloat(editingValues.amount),
      editingValues.unit
    );

    const updatedIngredient = {
      ...editingValues,
      unitPrice
    };

    setIngredients(prev => 
      prev.map(ing => ing.id === editingId ? updatedIngredient : ing)
    );
    
    setEditingId(null);
    setEditingValues(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValues(null);
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
              <TabsTrigger value="production">Production Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 bg-muted p-4 rounded-lg max-w-xl">
                        <h4 className="text-sm font-medium">Excel Import/Export Instructions</h4>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Required Columns:</p>
                          <ul className="text-sm text-muted-foreground list-disc pl-4">
                            <li>Name (ingredient name)</li>
                            <li>Price (numeric value)</li>
                            <li>Amount (numeric value)</li>
                            <li>Unit (must be one of the valid units)</li>
                          </ul>
                          <p className="text-sm font-medium">Optional Columns:</p>
                          <ul className="text-sm text-muted-foreground list-disc pl-4">
                            <li>Category (defaults to 'Other' if not provided)</li>
                            <li>Unit Price ($/oz) - will be auto-calculated if not provided</li>
                          </ul>
                          <p className="text-sm font-medium">Valid Units:</p>
                          <p className="text-sm text-muted-foreground">
                            {Object.values(Unit).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImportIngredients}
                            className="hidden"
                            id="import-file"
                          />
                          <Label
                            htmlFor="import-file"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                          >
                            Import from Excel
                          </Label>
                        </div>
                        <Button
                          onClick={handleExportIngredients}
                          disabled={ingredients.length === 0}
                        >
                          Export to Excel
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md whitespace-pre-line">
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
                        <Button 
                          onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                          className="w-full"
                        >
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
                            {ingredients.map((ingredient) => (
                              <tr key={ingredient.id} className="border-b">
                                <td className="p-2">
                                  {editingId === ingredient.id ? (
                                    <Input
                                      value={editingValues?.name || ''}
                                      onChange={(e) => handleInlineEdit('name', e.target.value)}
                                      className="w-full"
                                    />
                                  ) : ingredient.name}
                                </td>
                                <td className="p-2">
                                  {editingId === ingredient.id ? (
                                    <Input
                                      type="number"
                                      value={editingValues?.price || ''}
                                      onChange={(e) => handleInlineEdit('price', e.target.value)}
                                      className="w-full"
                                      min="0"
                                      step="0.01"
                                    />
                                  ) : `$${ingredient.price}`}
                                </td>
                                <td className="p-2">
                                  {editingId === ingredient.id ? (
                                    <Input
                                      type="number"
                                      value={editingValues?.amount || ''}
                                      onChange={(e) => handleInlineEdit('amount', e.target.value)}
                                      className="w-full"
                                      min="0"
                                      step="0.01"
                                    />
                                  ) : ingredient.amount}
                                </td>
                                <td className="p-2">
                                  {editingId === ingredient.id ? (
                                    <select
                                      value={editingValues?.unit || Unit.LB}
                                      onChange={(e) => handleInlineEdit('unit', e.target.value)}
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                      {Object.values(Unit).map((unit) => (
                                        <option key={unit} value={unit}>
                                          {unit}
                                        </option>
                                      ))}
                                    </select>
                                  ) : ingredient.unit}
                                </td>
                                <td className="p-2">
                                  {editingId === ingredient.id ? (
                                    <select
                                      value={editingValues?.category || 'Other'}
                                      onChange={(e) => handleInlineEdit('category', e.target.value)}
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                      <option value="Produce">Produce</option>
                                      <option value="Meat">Meat</option>
                                      <option value="Dairy">Dairy</option>
                                      <option value="Dry Goods">Dry Goods</option>
                                      <option value="Spices">Spices</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : ingredient.category}
                                </td>
                                <td className="p-2">${ingredient.unitPrice.toFixed(2)}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    {editingId === ingredient.id ? (
                                      <>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={saveInlineEdit}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={cancelEditing}
                                        >
                                          Cancel
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => startEditing(ingredient)}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDeleteIngredient(ingredients.indexOf(ingredient))}
                                        >
                                          Delete
                                        </Button>
                                      </>
                                    )}
                                  </div>
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
      <HelpDialog />
      {showDuplicatesDialog && (
        <DuplicateIngredientsDialog
          isOpen={showDuplicatesDialog}
          onClose={() => setShowDuplicatesDialog(false)}
          duplicates={duplicates.map(d => ({ ...d, action: undefined }))}
          onResolve={handleDuplicateResolution}
        />
      )}
    </div>
  );
};

export default IngredientRecipeCalculator; 