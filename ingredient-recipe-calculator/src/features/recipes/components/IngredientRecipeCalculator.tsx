import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useIngredientStore } from '../../../store/useIngredientStore';
import { useRecipeStore } from '../../../store/useRecipeStore';
import { usePreferencesStore } from '../../../store/usePreferencesStore';
import { Ingredient, Recipe, Unit, RecipeIngredient } from '../types';
import { validateIngredient, validateRecipe } from '../../../lib/validation';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/ui/toast-container';
import { v4 as uuidv4 } from 'uuid';

export const IngredientRecipeCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({});
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({});
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);

  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useIngredientStore();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipeStore();
  const { theme, defaultUnit, defaultCurrency, setTheme } = usePreferencesStore();
  const { toasts, addToast, removeToast } = useToast();

  const handleAddIngredient = () => {
    const validationErrors = validateIngredient(newIngredient);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        addToast({
          title: 'Validation Error',
          description: error.message,
          type: 'error',
        });
      });
      return;
    }

    const ingredient: Ingredient = {
      id: uuidv4(),
      ...newIngredient,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Ingredient;

    try {
      if (editingIngredientId) {
        updateIngredient(editingIngredientId, ingredient);
        setEditingIngredientId(null);
        addToast({
          title: 'Success',
          description: 'Ingredient updated successfully',
          type: 'success',
        });
      } else {
        addIngredient(ingredient);
        addToast({
          title: 'Success',
          description: 'Ingredient added successfully',
          type: 'success',
        });
      }
      setNewIngredient({});
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save ingredient',
        type: 'error',
      });
    }
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setNewIngredient(ingredient);
    setEditingIngredientId(ingredient.id);
  };

  const handleDeleteIngredient = (id: string) => {
    try {
      deleteIngredient(id);
      addToast({
        title: 'Success',
        description: 'Ingredient deleted successfully',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete ingredient',
        type: 'error',
      });
    }
  };

  const handleAddRecipe = () => {
    const validationErrors = validateRecipe(newRecipe);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        addToast({
          title: 'Validation Error',
          description: error.message,
          type: 'error',
        });
      });
      return;
    }

    const recipe: Recipe = {
      id: uuidv4(),
      ...newRecipe,
      totalCost: calculateRecipeCost(newRecipe.ingredients || []),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Recipe;

    try {
      addRecipe(recipe);
      setNewRecipe({});
      addToast({
        title: 'Success',
        description: 'Recipe added successfully',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save recipe',
        type: 'error',
      });
    }
  };

  const calculateRecipeCost = (recipeIngredients: RecipeIngredient[]) => {
    return recipeIngredients.reduce((total, { ingredientId, quantity }) => {
      const ingredient = ingredients.find((i) => i.id === ingredientId);
      if (!ingredient) return total;
      return total + (ingredient.cost * quantity);
    }, 0);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recipe Cost Calculator</CardTitle>
              <Button onClick={toggleTheme} variant="outline">
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients">
                {/* Ingredient Management Form */}
                <div className="space-y-4">
                  <Input
                    placeholder="Ingredient name"
                    value={newIngredient.name || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={newIngredient.cost || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, cost: parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newIngredient.quantity || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) })}
                  />
                  <Input
                    placeholder="Unit"
                    value={newIngredient.unit || defaultUnit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as Unit })}
                  />
                  <Button onClick={handleAddIngredient}>
                    {editingIngredientId ? 'Update Ingredient' : 'Add Ingredient'}
                  </Button>
                </div>

                {/* Ingredients List */}
                <div className="mt-4 space-y-2">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="ml-2 text-gray-600">
                          {ingredient.quantity} {ingredient.unit} - {ingredient.cost} {defaultCurrency}
                        </span>
                      </div>
                      <div>
                        <Button variant="ghost" onClick={() => handleEditIngredient(ingredient)}>
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteIngredient(ingredient.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recipes">
                {/* Recipe Management Form */}
                {/* Add recipe form implementation here */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 