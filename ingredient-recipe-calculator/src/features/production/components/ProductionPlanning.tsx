import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';
import { convertToOz } from '@/shared/utils/conversion';

import { Recipe } from '@/features/recipes/types';
import { Ingredient, Unit } from '@/features/ingredients/types';

// Unit conversion ratios with proper typing
const UNIT_CONVERSIONS: Record<Unit, Partial<Record<Unit, number>>> = {
  tsp: {
    tbsp: 1/3,
    cup: 1/48,
    oz: 1/6,
    lb: 1/96,
  },
  tbsp: {
    cup: 1/16,
    oz: 1/2,
    lb: 1/32,
  },
  cup: {
    lb: 1/2, // Assuming flour/sugar as base
    oz: 8,
  },
  oz: {
    lb: 1/16,
  },
  g: {
    kg: 1/1000,
    lb: 1/453.592,
  },
  ml: {
    l: 1/1000,
  },
  // Add empty objects for units without conversions
  kg: {},
  l: {},
  lb: {},
  piece: {}, // Add piece unit
};

// Target units for scaling up
const TARGET_UNITS: { [key in Unit]?: Unit } = {
  [Unit.TSP]: Unit.CUP,
  [Unit.TBSP]: Unit.CUP,
  [Unit.CUP]: Unit.LB,
  [Unit.OZ]: Unit.LB,
  [Unit.G]: Unit.KG,
  [Unit.ML]: Unit.L,
  [Unit.KG]: undefined,
  [Unit.L]: undefined,
  [Unit.LB]: undefined,
  [Unit.PIECE]: undefined,
};

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

interface SelectedRecipe {
  recipe: Recipe;
  batches: number;
}

interface PrepItem {
  recipeName: string;
  quantity: number;
  prepTime: number;
  shelfLife: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: Unit;
  }>;
}

interface ShoppingListItem {
  name: string;
  amount: number;
  unit: Unit;
  estimatedCost: number;
}

const convertUnit = (amount: number, fromUnit: Unit, toUnit: Unit): { amount: number; unit: Unit } => {
  if (fromUnit === toUnit) {
    return { amount, unit: fromUnit };
  }

  const conversions = UNIT_CONVERSIONS[fromUnit];
  const conversionRatio = conversions?.[toUnit];
  
  if (conversionRatio) {
    return {
      amount: amount * conversionRatio,
      unit: toUnit
    };
  }

  return { amount, unit: fromUnit };
};

const scaleToLargerUnit = (amount: number, unit: Unit): { amount: number; unit: Unit } => {
  const targetUnit = TARGET_UNITS[unit];
  if (!targetUnit) {
    return { amount, unit };
  }

  // Only convert if the amount is large enough
  const converted = convertUnit(amount, unit, targetUnit);
  if (converted.amount >= 1) {
    return converted;
  }
  return { amount, unit };
};

const calculateIngredientCost = (amount: number, fromUnit: Unit, ingredient: Ingredient): number => {
  // First convert both amounts to a common unit (oz) for comparison
  const ingredientAmountInOz = convertToOz(parseFloat(ingredient.amount), ingredient.unit);
  const requestedAmountInOz = convertToOz(amount, fromUnit);
  
  if (ingredientAmountInOz <= 0 || requestedAmountInOz <= 0) return 0;
  
  // Calculate the price per oz
  const pricePerOz = parseFloat(ingredient.price) / ingredientAmountInOz;
  
  // Calculate total cost
  return pricePerOz * requestedAmountInOz;
};

export const ProductionPlanning: React.FC<Props> = ({
  recipes,
  ingredients,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [prepList, setPrepList] = useState<PrepItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validate that all selected recipes and their ingredients still exist
  const validateData = (): boolean => {
    let isValid = true;
    const missingRecipes: string[] = [];
    const missingIngredients: string[] = [];

    selectedRecipes.forEach(({ recipe }) => {
      // Check if recipe still exists
      const currentRecipe = recipes.find(r => r.id === recipe.id);
      if (!currentRecipe) {
        missingRecipes.push(recipe.name);
        isValid = false;
        return;
      }

      // Check if all ingredients still exist
      recipe.ingredients.forEach(ing => {
        const ingredient = ingredients.find(i => i.name === ing.ingredient);
        if (!ingredient) {
          missingIngredients.push(ing.ingredient);
          isValid = false;
        }
      });
    });

    if (!isValid) {
      let errorMessage = 'Your production plan needs to be updated:\n\n';
      
      if (missingRecipes.length > 0) {
        errorMessage += 'Missing Recipes:\n';
        errorMessage += missingRecipes.map(name => `• ${name}`).join('\n');
        errorMessage += '\n\n';
      }
      
      if (missingIngredients.length > 0) {
        errorMessage += 'Missing Ingredients:\n';
        errorMessage += missingIngredients.map(name => `• ${name}`).join('\n');
        errorMessage += '\n\n';
      }

      errorMessage += 'Please click "Refresh Data" to update your plan with currently available items.';
      
      if (missingRecipes.length > 0 && missingIngredients.length === 0) {
        errorMessage += '\nYou may need to recreate the missing recipes.';
      } else if (missingIngredients.length > 0 && missingRecipes.length === 0) {
        errorMessage += '\nYou may need to add the missing ingredients.';
      } else {
        errorMessage += '\nYou may need to add the missing ingredients and recreate the missing recipes.';
      }

      setError(errorMessage);
    } else {
      setError(null);
    }

    return isValid;
  };

  // Add refresh function
  const handleRefresh = () => {
    // Clear error
    setError(null);
    
    // Filter out any recipes that no longer exist
    const validRecipes = selectedRecipes.filter(({ recipe }) => {
      const currentRecipe = recipes.find(r => r.id === recipe.id);
      if (!currentRecipe) return false;
      
      // Check if all ingredients exist
      return currentRecipe.ingredients.every(ing => 
        ingredients.some(i => i.name === ing.ingredient)
      );
    });

    setSelectedRecipes(validRecipes);
    
    // Regenerate lists with valid data
    if (validRecipes.length > 0) {
      generatePrepList();
    } else {
      setPrepList([]);
      setShoppingList([]);
    }
  };

  // Update useEffect to include validation
  useEffect(() => {
    if (selectedRecipes.length > 0) {
      if (validateData()) {
        generatePrepList();
      }
    } else {
      setPrepList([]);
      setShoppingList([]);
    }
  }, [selectedRecipes, recipes, ingredients]);

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe && !selectedRecipes.find(sr => sr.recipe.id === recipeId)) {
      setSelectedRecipes([...selectedRecipes, { recipe, batches: 1 }]);
    }
  };

  const handleBatchUpdate = (recipeId: string, batches: number) => {
    if (batches < 1) return; // Prevent negative or zero batches
    setSelectedRecipes(prev => prev.map(sr => 
      sr.recipe.id === recipeId ? { ...sr, batches } : sr
    ));
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipes(prev => prev.filter(sr => sr.recipe.id !== recipeId));
  };

  // Generate prep list based on selected recipes and batch quantities
  const generatePrepList = () => {
    const items = selectedRecipes.map(({ recipe, batches }) => {
      const scaledIngredients = recipe.ingredients.map(ing => {
        const totalAmount = ing.amount * batches;
        const scaled = scaleToLargerUnit(totalAmount, ing.unit);
        return {
          name: ing.ingredient,  // This is the ingredient name from the recipe
          ...scaled
        };
      });

      return {
        recipeName: recipe.name,
        quantity: batches,
        prepTime: recipe.prepTime,
        shelfLife: recipe.shelfLife,
        ingredients: scaledIngredients,
      };
    });

    setPrepList(items);
    calculateShoppingList(items);
  };

  // Calculate total ingredients needed for shopping list
  const calculateShoppingList = (currentPrepList: PrepItem[] = prepList) => {
    const tempList = new Map<string, { amount: number; unit: Unit; estimatedCost: number }>();
    
    currentPrepList.forEach(item => {
      item.ingredients.forEach(ing => {
        // Find the base ingredient to get its price
        const ingredientData = ingredients.find(i => i.name === ing.name);
        if (!ingredientData) return;

        // Calculate cost based on the ingredient's base price and amount
        const basePrice = parseFloat(ingredientData.price);
        const baseAmount = parseFloat(ingredientData.amount);
        const pricePerUnit = basePrice / baseAmount;
        const cost = pricePerUnit * ing.amount;

        const existing = tempList.get(ing.name);
        if (existing && existing.unit === ing.unit) {
          // Same unit, just add amounts and costs
          existing.amount += ing.amount;
          existing.estimatedCost += cost;
        } else if (existing) {
          // Different units, try to convert
          const converted = convertUnit(ing.amount, ing.unit, existing.unit);
          if (converted.unit === existing.unit) {
            existing.amount += converted.amount;
            existing.estimatedCost += cost;
          } else {
            // Can't convert, create new entry
            tempList.set(ing.name, { 
              amount: ing.amount, 
              unit: ing.unit,
              estimatedCost: cost
            });
          }
        } else {
          // First time seeing this ingredient
          tempList.set(ing.name, { 
            amount: ing.amount, 
            unit: ing.unit,
            estimatedCost: cost
          });
        }
      });
    });

    // Convert to array and scale units where possible
    const newList = Array.from(tempList.entries()).map(([name, details]) => {
      const { amount, unit } = scaleToLargerUnit(details.amount, details.unit);
      return { 
        name, 
        amount, 
        unit,
        estimatedCost: details.estimatedCost
      };
    });

    setShoppingList(newList);
  };

  // Export to Excel
  const exportToExcel = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const wb = XLSX.utils.book_new();

    // Prep List Sheet
    const prepListData = prepList.map(item => ({
      'Recipe': item.recipeName,
      'Batches': item.quantity,
      'Prep Time (mins)': item.prepTime,
      'Shelf Life (days)': item.shelfLife,
    }));
    const wsPrep = XLSX.utils.json_to_sheet(prepListData);
    XLSX.utils.book_append_sheet(wb, wsPrep, 'Prep List');

    // Recipe Ingredients Sheet
    const ingredientsData = prepList.flatMap(item => 
      item.ingredients.map(ing => ({
        'Recipe': item.recipeName,
        'Ingredient': ing.name,
        'Amount': ing.amount.toFixed(2),
        'Unit': ing.unit,
      }))
    );
    const wsIngredients = XLSX.utils.json_to_sheet(ingredientsData);
    XLSX.utils.book_append_sheet(wb, wsIngredients, 'Recipe Ingredients');

    // Shopping List Sheet
    const shoppingListData = shoppingList.map((item) => ({
      'Ingredient': item.name,
      'Total Amount': item.amount.toFixed(2),
      'Unit': item.unit,
      'Estimated Cost': `$${item.estimatedCost.toFixed(2)}`,
    }));

    // Add total row
    const totalCost = shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalRow = {
      'Ingredient': 'TOTAL',
      'Total Amount': '',
      'Estimated Cost': `$${totalCost.toFixed(2)}`,
    };

    const wsShopping = XLSX.utils.json_to_sheet([...shoppingListData, totalRow]);
    XLSX.utils.book_append_sheet(wb, wsShopping, 'Shopping List');

    XLSX.writeFile(wb, `production_plan_${currentDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md space-y-2">
          <p className="whitespace-pre-line">{error}</p>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="mt-2"
          >
            Refresh Data
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-4">
        <div>
          <Label htmlFor="production-date">Production Date</Label>
          <Input
            id="production-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="recipe-select">Add Recipe</Label>
          <select
            id="recipe-select"
            onChange={(e) => handleRecipeSelect(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">Select a recipe...</option>
            {recipes.map(recipe => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="mb-[2px]"
        >
          Refresh Data
        </Button>
      </div>

      {/* Selected Recipes */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedRecipes.map(({ recipe, batches }) => (
              <div key={recipe.id} className="flex items-center gap-4 border-b pb-2">
                <span className="flex-grow">{recipe.name}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`batches-${recipe.id}`}>Batches:</Label>
                  <Input
                    id={`batches-${recipe.id}`}
                    type="number"
                    min="1"
                    value={batches}
                    onChange={(e) => handleBatchUpdate(recipe.id, parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveRecipe(recipe.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRecipes.length > 0 && (
        <Tabs defaultValue="prep">
          <TabsList>
            <TabsTrigger value="prep">Prep List</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          </TabsList>

          <TabsContent value="prep">
            <Card>
              <CardHeader>
                <CardTitle>Prep List</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {prepList.map((item, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h4 className="font-medium">{item.recipeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} batches
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Ingredients:</p>
                          <ul className="text-sm text-muted-foreground">
                            {item.ingredients.map((ing, i) => (
                              <li key={i}>
                                {ing.name}: {ing.amount.toFixed(2)} {ing.unit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Production Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {prepList
                      .sort((a, b) => b.prepTime - a.prepTime)
                      .map((item, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.recipeName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} batches × {item.prepTime} mins = {item.quantity * item.prepTime} total mins
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Start Time: {new Date(selectedDate).toLocaleTimeString()}</p>
                              <p className="text-sm text-muted-foreground">
                                Must complete by: {item.shelfLife} days
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shopping">
            <Card>
              <CardHeader>
                <CardTitle>Shopping List</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {shoppingList.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2">
                        <span className="font-medium">{item.name}</span>
                        <div className="text-right">
                          <div>{item.amount.toFixed(2)} {item.unit}</div>
                          <div className="text-sm text-muted-foreground">
                            Est. Cost: ${item.estimatedCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {shoppingList.length > 0 && (
                      <div className="flex justify-end pt-4 border-t">
                        <div className="text-right">
                          <div className="font-medium">Total Estimated Cost</div>
                          <div className="text-lg">
                            ${shoppingList.reduce((total, item) => total + item.estimatedCost, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <Button 
                  onClick={exportToExcel} 
                  className="mt-4"
                >
                  Export to Excel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}; 