import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { ScrollArea } from "@components/ui/scroll-area";
import { Recipe, NewRecipe, RecipeIngredient, NewRecipeIngredient } from '../types';
import { Ingredient, Unit } from '@features/ingredients/types';

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (index: number, recipe: Recipe) => void;
  onDeleteRecipe: (index: number) => void;
}

const validateRecipe = (recipe: NewRecipe, existingRecipes: Recipe[], currentEditingId?: string): { isValid: boolean; error?: string } => {
  // Check for empty name
  if (recipe.name.trim() === '') {
    return { isValid: false, error: 'Recipe name is required' };
  }

  // Check for duplicate recipe name
  const isDuplicateName = existingRecipes.some(
    existing => existing.name.toLowerCase() === recipe.name.trim().toLowerCase() 
      && existing.id !== currentEditingId
  );
  if (isDuplicateName) {
    return { isValid: false, error: 'A recipe with this name already exists' };
  }

  // Check for empty ingredients
  if (recipe.ingredients.length === 0) {
    return { isValid: false, error: 'At least one ingredient is required' };
  }

  // Check for duplicate ingredients in the recipe
  const ingredientNames = recipe.ingredients.map(ing => ing.ingredient.toLowerCase());
  const hasDuplicateIngredients = ingredientNames.length !== new Set(ingredientNames).size;
  if (hasDuplicateIngredients) {
    return { isValid: false, error: 'Each ingredient can only be used once in a recipe' };
  }

  // Check for valid numbers
  if (recipe.yield <= 0) {
    return { isValid: false, error: 'Yield must be greater than 0' };
  }
  if (recipe.monthlySales < 0) {
    return { isValid: false, error: 'Monthly sales cannot be negative' };
  }

  return { isValid: true };
};

// Add validation for unique ingredient names
const validateIngredientName = (name: string, existingIngredients: Ingredient[]): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Ingredient name is required' };
  }

  const isDuplicateName = existingIngredients.some(
    existing => existing.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (isDuplicateName) {
    return { isValid: false, error: 'An ingredient with this name already exists' };
  }

  return { isValid: true };
};

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
    prepTime: 0,
    shelfLife: 1,
  });

  const [editingRecipe, setEditingRecipe] = useState<{ index: number; recipe: Recipe } | null>(null);

  const [newRecipeIngredient, setNewRecipeIngredient] = useState<NewRecipeIngredient>({
    ingredient: '',
    amount: '',
    unit: 'lb' as Unit,
  });

  const [selectedRecipeForScaling, setSelectedRecipeForScaling] = useState<Recipe | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [targetServings, setTargetServings] = useState<number>(1);
  const [error, setError] = useState<string>('');

  // Add hover message state
  const [hoverMessage, setHoverMessage] = useState<string>('');

  const handleEditRecipe = (index: number, recipe: Recipe) => {
    setEditingRecipe({ index, recipe });
    setNewRecipe({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      yield: recipe.yield,
      monthlySales: recipe.monthlySales,
      prepTime: recipe.prepTime,
      shelfLife: recipe.shelfLife,
    });
  };

  const handleAddIngredientToRecipe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(newRecipeIngredient.amount.toString());
    
    // Check if ingredient already exists in recipe
    const isDuplicateIngredient = newRecipe.ingredients.some(
      ing => ing.ingredient.toLowerCase() === newRecipeIngredient.ingredient.toLowerCase()
    );

    if (isDuplicateIngredient) {
      setError('This ingredient is already in the recipe');
      return;
    }
    
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const validation = validateRecipe(
        newRecipe, 
        recipes, 
        editingRecipe?.recipe.id
      );

      if (!validation.isValid) {
        setError(validation.error || 'Invalid recipe');
        return;
      }

      const recipe: Recipe = {
        id: editingRecipe?.recipe.id || crypto.randomUUID(),
        name: newRecipe.name.trim(),
        ingredients: [...newRecipe.ingredients],
        yield: Math.max(1, Number(newRecipe.yield)),
        monthlySales: Math.max(0, Number(newRecipe.monthlySales)),
        prepTime: Math.max(0, Number(newRecipe.prepTime)),
        shelfLife: Math.max(1, Number(newRecipe.shelfLife)),
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
        prepTime: 0,
        shelfLife: 1,
      });
      
      setNewRecipeIngredient({
        ingredient: '',
        amount: '',
        unit: 'lb' as Unit,
      });
      
      setError('');
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe');
    }
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, recipeIngredient) => {
      const ingredient = ingredients.find(i => i.name === recipeIngredient.ingredient);
      if (!ingredient) return total;
      return total + (ingredient.unitPrice * recipeIngredient.amount);
    }, 0);
  };

  // Update the ingredient selection handler
  const handleIngredientSelect = (value: string) => {
    setError('');
    setNewRecipeIngredient(prev => ({
      ...prev,
      ingredient: value
    }));
  };

  // Update the button's disabled state and hover message
  const getSubmitButtonState = () => {
    const validation = validateRecipe(newRecipe, recipes, editingRecipe?.recipe.id);
    return { isDisabled: !validation.isValid, error: validation.error || '' };
  };

  const handleMouseEnter = () => {
    const { error } = getSubmitButtonState();
    setHoverMessage(error);
  };

  const handleMouseLeave = () => {
    setHoverMessage('');
  };

  const { isDisabled } = getSubmitButtonState();

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-6"
      autoComplete="off"
    >
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}
      
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
        <div>
          <Label htmlFor="prep-time">Prep Time (minutes)</Label>
          <Input
            id="prep-time"
            name="prep-time"
            type="number"
            autoComplete="off"
            aria-label="Preparation time in minutes"
            value={newRecipe.prepTime}
            onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: Number(e.target.value) })}
            placeholder="Prep time in minutes"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="shelf-life">Shelf Life (days)</Label>
          <Input
            id="shelf-life"
            name="shelf-life"
            type="number"
            autoComplete="off"
            aria-label="Shelf life in days"
            value={newRecipe.shelfLife}
            onChange={(e) => setNewRecipe({ ...newRecipe, shelfLife: Number(e.target.value) })}
            placeholder="Shelf life in days"
            min="1"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="ingredient-select">Ingredient</Label>
            <select
              id="ingredient-select"
              name="ingredient-select"
              value={newRecipeIngredient.ingredient}
              onChange={(e) => handleIngredientSelect(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Select ingredient"
            >
              <option value="">Select an ingredient</option>
              {ingredients
                .filter(ingredient => 
                  !newRecipe.ingredients.some(
                    recipeIng => recipeIng.ingredient.toLowerCase() === ingredient.name.toLowerCase()
                  )
                )
                .map((ingredient) => (
                  <option key={ingredient.name} value={ingredient.name}>
                    {ingredient.name}
                  </option>
                ))}
            </select>
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
            <select
              id="ingredient-unit"
              name="ingredient-unit"
              value={newRecipeIngredient.unit}
              onChange={(e) => {
                setNewRecipeIngredient(prev => ({
                  ...prev,
                  unit: e.target.value as Unit
                }));
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Select unit"
            >
              <option value="lb">lb</option>
              <option value="oz">oz</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="piece">piece</option>
            </select>
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
          <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isDisabled}
            >
              {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
            </Button>
            {hoverMessage && (
              <div 
                className="absolute z-50 p-2 bg-popover text-popover-foreground rounded shadow-lg text-sm max-w-xs break-words"
                style={{
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '0.5rem',
                  width: 'max-content',
                  minWidth: '200px'
                }}
              >
                {hoverMessage}
              </div>
            )}
          </div>
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
                <th className="text-left p-2">Prep Time</th>
                <th className="text-left p-2">Shelf Life</th>
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
                  <td className="p-2">{recipe.prepTime} mins</td>
                  <td className="p-2">{recipe.shelfLife} days</td>
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

      <Card>
        <CardHeader>
          <CardTitle>Recipe Scaling Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scale-recipe">Select Recipe</Label>
                <select
                  id="scale-recipe"
                  name="scale-recipe"
                  value={selectedRecipeForScaling?.name || ''}
                  onChange={(e) => {
                    const recipe = recipes.find(r => r.name === e.target.value);
                    setSelectedRecipeForScaling(recipe || null);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Select recipe to scale"
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.name} value={recipe.name}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="scale-factor">Scale Factor</Label>
                <Input
                  id="scale-factor"
                  name="scale-factor"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(Number(e.target.value))}
                  placeholder="Enter scale factor (e.g., 2 for double)"
                />
              </div>
              <div>
                <Label htmlFor="scale-servings">Target Servings</Label>
                <Input
                  id="scale-servings"
                  name="scale-servings"
                  type="number"
                  min="1"
                  value={targetServings}
                  onChange={(e) => {
                    const servings = Number(e.target.value);
                    setTargetServings(servings);
                    if (selectedRecipeForScaling) {
                      setScaleFactor(servings / selectedRecipeForScaling.yield);
                    }
                  }}
                  placeholder="Enter target number of servings"
                />
              </div>
            </div>

            {selectedRecipeForScaling && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Scaled Recipe: {selectedRecipeForScaling.name}</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Original Yield</p>
                      <p className="font-medium">{selectedRecipeForScaling.yield} servings</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scaled Yield</p>
                      <p className="font-medium">{Math.round(selectedRecipeForScaling.yield * scaleFactor)} servings</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h5 className="font-medium mb-2">Scaled Ingredients</h5>
                    <div className="space-y-2">
                      {selectedRecipeForScaling.ingredients.map((ing, index) => (
                        <div key={index} className="text-sm">
                          {(ing.amount * scaleFactor).toFixed(2)} {ing.unit} {ing.ingredient}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Original Cost</p>
                      <p className="font-medium">${calculateRecipeCost(selectedRecipeForScaling).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scaled Cost</p>
                      <p className="font-medium">${(calculateRecipeCost(selectedRecipeForScaling) * scaleFactor).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}; 