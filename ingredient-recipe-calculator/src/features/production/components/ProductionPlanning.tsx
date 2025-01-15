import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';

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
  tsp: 'cup',
  tbsp: 'cup',
  cup: 'lb',
  oz: 'lb',
  g: 'kg',
  ml: 'l',
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

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe && !selectedRecipes.find(sr => sr.recipe.id === recipeId)) {
      setSelectedRecipes([...selectedRecipes, { recipe, batches: 1 }]);
    }
  };

  const handleBatchUpdate = (recipeId: string, batches: number) => {
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
          name: ing.ingredient,
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
  };

  // Calculate total ingredients needed for shopping list
  const calculateShoppingList = () => {
    const tempList = new Map<string, { amount: number; unit: Unit }>();
    
    prepList.forEach(item => {
      item.ingredients.forEach(ing => {
        const existing = tempList.get(ing.name);
        if (existing && existing.unit === ing.unit) {
          existing.amount += ing.amount;
        } else if (existing) {
          // If units don't match, try to convert to the larger unit
          const converted = convertUnit(ing.amount, ing.unit, existing.unit);
          if (converted.unit === existing.unit) {
            existing.amount += converted.amount;
          } else {
            tempList.set(ing.name, { amount: ing.amount, unit: ing.unit });
          }
        } else {
          tempList.set(ing.name, { amount: ing.amount, unit: ing.unit });
        }
      });
    });

    // Scale up units for the final list
    const newList = Array.from(tempList.entries()).map(([name, details]) => {
      const { amount, unit } = scaleToLargerUnit(details.amount, details.unit);
      return { name, amount, unit };
    });

    setShoppingList(newList);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create workbook
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

    // Ingredients Sheet
    const ingredientsData = prepList.flatMap(item => 
      item.ingredients.map(ing => ({
        'Recipe': item.recipeName,
        'Ingredient': ing.name,
        'Amount': ing.amount,
        'Unit': ing.unit,
      }))
    );
    const wsIngredients = XLSX.utils.json_to_sheet(ingredientsData);
    XLSX.utils.book_append_sheet(wb, wsIngredients, 'Ingredients');

    // Shopping List Sheet
    const shoppingListData = shoppingList.map((item, index) => ({
      'Ingredient': item.name,
      'Amount': item.amount,
      'Unit': item.unit,
    }));
    const wsShopping = XLSX.utils.json_to_sheet(shoppingListData);
    XLSX.utils.book_append_sheet(wb, wsShopping, 'Shopping List');

    // Save the file
    XLSX.writeFile(wb, `Production_Plan_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
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
        <div className="flex gap-4">
          <Button onClick={generatePrepList}>Generate Plan</Button>
          {prepList.length > 0 && (
            <Button onClick={exportToExcel}>Export to Excel</Button>
          )}
        </div>
      )}

      {prepList.length > 0 && (
        <Tabs defaultValue="prep-list">
          <TabsList>
            <TabsTrigger value="prep-list">Prep List</TabsTrigger>
            <TabsTrigger value="schedule">Production Schedule</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          </TabsList>

          <TabsContent value="prep-list">
            <Card>
              <CardHeader>
                <CardTitle>Daily Prep List</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {prepList.map((item, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.recipeName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} batches
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Prep Time: {item.prepTime} mins</p>
                            <p className="text-sm text-muted-foreground">
                              Shelf Life: {item.shelfLife} days
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {item.ingredients.map((ing, i) => (
                            <p key={i} className="text-sm">
                              {ing.amount.toFixed(2)} {ing.unit} {ing.name}
                            </p>
                          ))}
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
                      <div key={index} className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <span>{item.amount.toFixed(2)} {item.unit}</span>
                      </div>
                    ))}
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