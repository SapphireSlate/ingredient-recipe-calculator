import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Select, SelectItem } from "@components/ui/select";
import { ScrollArea } from "@components/ui/scroll-area";
import { Label } from "@components/ui/label";

import { Recipe, NewRecipe, RecipeIngredient, NewRecipeIngredient } from '../types';
import { Ingredient, Unit } from '@features/ingredients/types';

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (index: number, recipe: Recipe) => void;
  onDeleteRecipe: (index: number) => void;
}

export const RecipeManagement: React.FC<Props> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}) => {
  const [newRecipe, setNewRecipe] = useState<NewRecipe>({
    name: '',
    ingredients: [],
    yield: 1,
    monthlySales: 0,
  });

  const [editingRecipe, setEditingRecipe] = useState<{ index: number; recipe: Recipe } | null>(null);

  const [newRecipeIngredient, setNewRecipeIngredient] = useState<NewRecipeIngredient>({
    ingredient: '',
    amount: '',
    unit: 'lb',
  });

  const handleEditRecipe = (index: number, recipe: Recipe) => {
    setEditingRecipe({ index, recipe });
    setNewRecipe({
      name: recipe.name,
      ingredients: recipe.ingredients,
      yield: recipe.yield,
      monthlySales: recipe.monthlySales,
    });
  };

  const handleAddIngredientToRecipe = () => {
    if (newRecipeIngredient.ingredient && newRecipeIngredient.amount) {
      setNewRecipe({
        ...newRecipe,
        ingredients: [
          ...newRecipe.ingredients,
          {
            ingredient: newRecipeIngredient.ingredient,
            amount: Number(newRecipeIngredient.amount),
            unit: newRecipeIngredient.unit,
          },
        ],
      });
      setNewRecipeIngredient({ ingredient: '', amount: '', unit: 'lb' });
    }
  };

  const handleRemoveIngredientFromRecipe = (index: number) => {
    const newIngredients = [...newRecipe.ingredients];
    newIngredients.splice(index, 1);
    setNewRecipe({ ...newRecipe, ingredients: newIngredients });
  };

  const handleSaveRecipe = () => {
    if (newRecipe.name && newRecipe.ingredients.length > 0) {
      const recipe: Recipe = {
        name: newRecipe.name,
        ingredients: newRecipe.ingredients,
        yield: Number(newRecipe.yield),
        monthlySales: Number(newRecipe.monthlySales),
      };

      if (editingRecipe) {
        onUpdateRecipe(editingRecipe.index, recipe);
        setEditingRecipe(null);
      } else {
        onAddRecipe(recipe);
      }

      setNewRecipe({
        name: '',
        ingredients: [],
        yield: 1,
        monthlySales: 0,
      });
    }
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, recipeIngredient) => {
      const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
      if (!ingredient) return total;
      return total + (ingredient.unitPrice * Number(recipeIngredient.amount));
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="recipeName">Recipe Name</Label>
          <Input
            id="recipeName"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            placeholder="Recipe name"
          />
        </div>
        <div>
          <Label htmlFor="recipeYield">Yield</Label>
          <Input
            id="recipeYield"
            type="number"
            value={newRecipe.yield}
            onChange={(e) => setNewRecipe({ ...newRecipe, yield: Number(e.target.value) })}
            placeholder="Recipe yield"
          />
        </div>
        <div>
          <Label htmlFor="monthlySales">Monthly Sales</Label>
          <Input
            id="monthlySales"
            type="number"
            value={newRecipe.monthlySales}
            onChange={(e) => setNewRecipe({ ...newRecipe, monthlySales: Number(e.target.value) })}
            placeholder="Monthly sales"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ingredient">Ingredient</Label>
            <Select
              value={newRecipeIngredient.ingredient}
              onValueChange={(value) => setNewRecipeIngredient({ ...newRecipeIngredient, ingredient: value })}
            >
              {ingredients.map((ingredient) => (
                <SelectItem key={ingredient.name} value={ingredient.name}>
                  {ingredient.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={newRecipeIngredient.amount}
              onChange={(e) => setNewRecipeIngredient({ ...newRecipeIngredient, amount: e.target.value })}
              placeholder="Amount"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddIngredientToRecipe} className="w-full">Add Ingredient</Button>
          </div>
        </div>

        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-2">Recipe Ingredients</h4>
          {newRecipe.ingredients.map((ing, index) => (
            <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b space-y-2 sm:space-y-0">
              <span className="text-sm">
                {ing.amount} {ing.unit} {ing.ingredient}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveIngredientFromRecipe(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveRecipe} className="w-full sm:w-auto">
            {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <ScrollArea className="h-[300px]">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Ingredients</th>
                <th className="text-left p-2">Cost</th>
                <th className="text-left p-2">Yield</th>
                <th className="text-left p-2">Monthly Sales</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{recipe.name}</td>
                  <td className="p-2">
                    <div className="space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} className="text-sm">
                          {ing.amount} {ing.unit} {ing.ingredient}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2">${calculateRecipeCost(recipe).toFixed(2)}</td>
                  <td className="p-2">{recipe.yield}</td>
                  <td className="p-2">{recipe.monthlySales}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRecipe(index, recipe)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRecipe(index)}
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
  );
}; 