import React, { useState, FormEvent } from 'react';
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
    unit: 'lb' as Unit,
  });

  const handleEditRecipe = (index: number, recipe: Recipe) => {
    setEditingRecipe({ index, recipe });
    setNewRecipe({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      yield: recipe.yield,
      monthlySales: recipe.monthlySales,
    });
  };

  const handleAddIngredientToRecipe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const amount = parseFloat(newRecipeIngredient.amount.toString());
    
    if (newRecipeIngredient.ingredient && !isNaN(amount) && amount > 0) {
      const newIngredient: RecipeIngredient = {
        ingredient: newRecipeIngredient.ingredient,
        amount: amount,
        unit: newRecipeIngredient.unit,
      };

      setNewRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient],
      }));

      // Reset the ingredient form
      setNewRecipeIngredient({
        ingredient: '',
        amount: '',
        unit: 'lb' as Unit,
      });
    }
  };

  const handleRemoveIngredientFromRecipe = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const validateRecipe = (recipe: NewRecipe): boolean => {
    return (
      recipe.name.trim() !== '' &&
      recipe.ingredients.length > 0 &&
      recipe.yield > 0 &&
      recipe.monthlySales >= 0
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (validateRecipe(newRecipe)) {
        const recipe: Recipe = {
          name: newRecipe.name.trim(),
          ingredients: [...newRecipe.ingredients],
          yield: Math.max(1, Number(newRecipe.yield)),
          monthlySales: Math.max(0, Number(newRecipe.monthlySales)),
        };

        if (editingRecipe) {
          await onUpdateRecipe(editingRecipe.index, recipe);
          setEditingRecipe(null);
        } else {
          await onAddRecipe(recipe);
        }

        // Reset form
        setNewRecipe({
          name: '',
          ingredients: [],
          yield: 1,
          monthlySales: 0,
        });
        
        setNewRecipeIngredient({
          ingredient: '',
          amount: '',
          unit: 'lb' as Unit,
        });
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, recipeIngredient) => {
      const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
      if (!ingredient) return total;
      return total + (ingredient.unitPrice * recipeIngredient.amount);
    }, 0);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-6"
      autoComplete="off"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="recipe-name">Recipe Name</Label>
          <Input
            id="recipe-name"
            name="recipe-name"
            type="text"
            autoComplete="off"
            aria-label="Recipe name"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            placeholder="Recipe name"
            required
          />
        </div>
        <div>
          <Label htmlFor="recipe-yield">Yield</Label>
          <Input
            id="recipe-yield"
            name="recipe-yield"
            type="number"
            autoComplete="off"
            aria-label="Recipe yield"
            value={newRecipe.yield}
            onChange={(e) => setNewRecipe({ ...newRecipe, yield: Number(e.target.value) })}
            placeholder="Recipe yield"
            min="1"
            required
          />
        </div>
        <div>
          <Label htmlFor="monthly-sales">Monthly Sales</Label>
          <Input
            id="monthly-sales"
            name="monthly-sales"
            type="number"
            autoComplete="off"
            aria-label="Monthly sales"
            value={newRecipe.monthlySales}
            onChange={(e) => setNewRecipe({ ...newRecipe, monthlySales: Number(e.target.value) })}
            placeholder="Monthly sales"
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="ingredient-select">Ingredient</Label>
            <Select
              id="ingredient-select"
              name="ingredient-select"
              value={newRecipeIngredient.ingredient}
              onValueChange={(value) => {
                setNewRecipeIngredient(prev => ({
                  ...prev,
                  ingredient: value
                }));
              }}
              aria-label="Select ingredient"
            >
              <option value="">Select an ingredient</option>
              {ingredients.map((ingredient) => (
                <SelectItem key={ingredient.name} value={ingredient.name}>
                  {ingredient.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ingredient-amount">Amount</Label>
            <Input
              id="ingredient-amount"
              name="ingredient-amount"
              type="number"
              autoComplete="off"
              aria-label="Ingredient amount"
              value={newRecipeIngredient.amount}
              onChange={(e) => {
                const value = e.target.value;
                setNewRecipeIngredient(prev => ({
                  ...prev,
                  amount: value
                }));
              }}
              placeholder="Amount"
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="ingredient-unit">Unit</Label>
            <Select
              id="ingredient-unit"
              name="ingredient-unit"
              value={newRecipeIngredient.unit}
              onValueChange={(value) => {
                setNewRecipeIngredient(prev => ({
                  ...prev,
                  unit: value as Unit
                }));
              }}
              aria-label="Select unit"
            >
              <SelectItem value="lb">lb</SelectItem>
              <SelectItem value="oz">oz</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="cup">cup</SelectItem>
              <SelectItem value="tbsp">tbsp</SelectItem>
              <SelectItem value="tsp">tsp</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="l">l</SelectItem>
              <SelectItem value="piece">piece</SelectItem>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              type="button"
              onClick={handleAddIngredientToRecipe} 
              className="w-full"
              disabled={!newRecipeIngredient.ingredient || !newRecipeIngredient.amount}
              aria-label="Add ingredient to recipe"
            >
              Add Ingredient
            </Button>
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
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveIngredientFromRecipe(index)}
                aria-label={`Remove ${ing.ingredient}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={!validateRecipe(newRecipe)}
          >
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
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRecipe(index, recipe)}
                      aria-label={`Edit ${recipe.name}`}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRecipe(index)}
                      aria-label={`Delete ${recipe.name}`}
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
    </form>
  );
}; 