import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Ingredient, Unit } from '@/features/ingredients/types';
import { Recipe, RecipeIngredient } from '@/features/recipes/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (index: number, recipe: Recipe) => void;
  onDeleteRecipe: (index: number) => void;
}

interface RecipeIngredientEdit {
  ingredient: string;
  amount: number;
  unit: Unit;
}

export const RecipeManagement: React.FC<Props> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Recipe | null>(null);
  const [editingIngredients, setEditingIngredients] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [scalingRecipe, setScalingRecipe] = useState<Recipe | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [newRecipeDialogOpen, setNewRecipeDialogOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: '',
    name: '',
    ingredients: [],
    yield: 1,
    sales: 0,
    prepTime: 0,
    shelfLife: 0,
    monthlySales: 0
  });

  const handleAddNewRecipe = () => {
    const recipeToAdd = {
      ...newRecipe,
      id: uuidv4()
    };
    onAddRecipe(recipeToAdd);
    setNewRecipe({
      id: '',
      name: '',
      ingredients: [],
      yield: 1,
      sales: 0,
      prepTime: 0,
      shelfLife: 0,
      monthlySales: 0
    });
    setNewRecipeDialogOpen(false);
  };

  const handleAddIngredientToNew = () => {
    if (ingredients.length === 0) return;
    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        {
          ingredient: ingredients[0].name,
          amount: 0,
          unit: Unit.LB
        }
      ]
    });
  };

  const startEditing = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditingValues(recipe);
  };

  const handleInlineEdit = (field: keyof Recipe, value: string | number) => {
    if (!editingValues) return;
    
    setEditingValues({
      ...editingValues,
      [field]: value,
    });
  };

  const saveInlineEdit = () => {
    if (!editingValues || !editingId) return;

    const index = recipes.findIndex(r => r.id === editingId);
    if (index !== -1) {
      onUpdateRecipe(index, editingValues);
    }
    
    setEditingId(null);
    setEditingValues(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const startEditingIngredients = (recipe: Recipe) => {
    setEditingIngredients({...recipe});
    setIsDialogOpen(true);
  };

  const handleIngredientEdit = (index: number, field: keyof RecipeIngredientEdit, value: string | number) => {
    if (!editingIngredients) return;

    const updatedIngredients = [...editingIngredients.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'amount' ? parseFloat(value as string) : value
    };

    setEditingIngredients({
      ...editingIngredients,
      ingredients: updatedIngredients
    });
  };

  const saveIngredientEdits = () => {
    if (!editingIngredients) return;

    const index = recipes.findIndex(r => r.id === editingIngredients.id);
    if (index !== -1) {
      onUpdateRecipe(index, editingIngredients);
    }
    
    setEditingIngredients(null);
    setIsDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setEditingIngredients(null);
    setIsDialogOpen(false);
  };

  const startScaling = (recipe: Recipe) => {
    setScalingRecipe({...recipe});
    setScaleDialogOpen(true);
  };

  const handleScaleRecipe = () => {
    if (!scalingRecipe) return;

    const scaledRecipe: Recipe = {
      ...scalingRecipe,
      yield: Math.round(scalingRecipe.yield * scaleFactor),
      ingredients: scalingRecipe.ingredients.map(ing => ({
        ...ing,
        amount: parseFloat((ing.amount * scaleFactor).toFixed(2))
      }))
    };

    const index = recipes.findIndex(r => r.id === scalingRecipe.id);
    if (index !== -1) {
      onUpdateRecipe(index, scaledRecipe);
    }

    setScalingRecipe(null);
    setScaleFactor(1);
    setScaleDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={newRecipeDialogOpen} onOpenChange={setNewRecipeDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Recipe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipe Name</Label>
                <Input
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  placeholder="Enter recipe name"
                />
              </div>
              <div>
                <Label>Yield (servings)</Label>
                <Input
                  type="number"
                  value={newRecipe.yield}
                  onChange={(e) => setNewRecipe({ ...newRecipe, yield: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <Label>Sales Price ($)</Label>
                <Input
                  type="number"
                  value={newRecipe.sales}
                  onChange={(e) => setNewRecipe({ ...newRecipe, sales: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Prep Time (minutes)</Label>
                <Input
                  type="number"
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label>Shelf Life (days)</Label>
                <Input
                  type="number"
                  value={newRecipe.shelfLife}
                  onChange={(e) => setNewRecipe({ ...newRecipe, shelfLife: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label>Monthly Sales</Label>
                <Input
                  type="number"
                  value={newRecipe.monthlySales}
                  onChange={(e) => setNewRecipe({ ...newRecipe, monthlySales: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Ingredients</Label>
                  <Button variant="outline" size="sm" onClick={handleAddIngredientToNew}>
                    Add Ingredient
                  </Button>
                </div>
                {newRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2">
                    <select
                      value={ing.ingredient}
                      onChange={(e) => {
                        const updatedIngredients = [...newRecipe.ingredients];
                        updatedIngredients[idx] = { ...ing, ingredient: e.target.value };
                        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.name}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => {
                        const updatedIngredients = [...newRecipe.ingredients];
                        updatedIngredients[idx] = { ...ing, amount: parseFloat(e.target.value) };
                        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
                      }}
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => {
                        const updatedIngredients = [...newRecipe.ingredients];
                        updatedIngredients[idx] = { ...ing, unit: e.target.value as Unit };
                        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.values(Unit).map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updatedIngredients = [...newRecipe.ingredients];
                        updatedIngredients.splice(idx, 1);
                        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewRecipeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewRecipe} disabled={!newRecipe.name || newRecipe.ingredients.length === 0}>
                Add Recipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {recipes.map((recipe, index) => (
            <Card key={recipe.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-grow grid grid-cols-6 gap-4">
                    <div>
                      {editingId === recipe.id ? (
                        <Input
                          value={editingValues?.name || ''}
                          onChange={(e) => handleInlineEdit('name', e.target.value)}
                          className="w-full"
                          placeholder="Recipe name"
                        />
                      ) : (
                        <span className="font-medium">{recipe.name}</span>
                      )}
                    </div>
                    <div>
                      {editingId === recipe.id ? (
                        <Input
                          type="number"
                          value={editingValues?.yield || ''}
                          onChange={(e) => handleInlineEdit('yield', parseInt(e.target.value))}
                          className="w-full"
                          placeholder="Yield"
                        />
                      ) : (
                        <span>Yield: {recipe.yield}</span>
                      )}
                    </div>
                    <div>
                      {editingId === recipe.id ? (
                        <Input
                          type="number"
                          value={editingValues?.sales || ''}
                          onChange={(e) => handleInlineEdit('sales', parseFloat(e.target.value))}
                          className="w-full"
                          placeholder="Sales price"
                        />
                      ) : (
                        <span>${recipe.sales}</span>
                      )}
                    </div>
                    <div>
                      {editingId === recipe.id ? (
                        <Input
                          type="number"
                          value={editingValues?.prepTime || ''}
                          onChange={(e) => handleInlineEdit('prepTime', parseInt(e.target.value))}
                          className="w-full"
                          placeholder="Prep time (mins)"
                        />
                      ) : (
                        <span>{recipe.prepTime} mins</span>
                      )}
                    </div>
                    <div>
                      {editingId === recipe.id ? (
                        <Input
                          type="number"
                          value={editingValues?.shelfLife || ''}
                          onChange={(e) => handleInlineEdit('shelfLife', parseInt(e.target.value))}
                          className="w-full"
                          placeholder="Shelf life (days)"
                        />
                      ) : (
                        <span>{recipe.shelfLife} days</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === recipe.id ? (
                        <>
                          <Button variant="default" size="sm" onClick={saveInlineEdit}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEditing(recipe)}>
                            Edit
                          </Button>
                          <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
                            setIsDialogOpen(open);
                            if (!open) {
                              setEditingIngredients(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditingIngredients(recipe)}
                              >
                                Edit Ingredients
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Recipe Ingredients - {recipe.name}</DialogTitle>
                              </DialogHeader>
                              {editingIngredients && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-4 gap-4 font-medium">
                                    <div>Ingredient</div>
                                    <div>Amount</div>
                                    <div>Unit</div>
                                    <div>Actions</div>
                                  </div>
                                  {editingIngredients.ingredients.map((ing, idx) => (
                                    <div key={idx} className="grid grid-cols-4 gap-4">
                                      <select
                                        value={ing.ingredient}
                                        onChange={(e) => handleIngredientEdit(idx, 'ingredient', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      >
                                        {ingredients.map((i) => (
                                          <option key={i.id} value={i.name}>
                                            {i.name}
                                          </option>
                                        ))}
                                      </select>
                                      <Input
                                        type="number"
                                        value={ing.amount}
                                        onChange={(e) => handleIngredientEdit(idx, 'amount', e.target.value)}
                                        min="0"
                                        step="0.01"
                                      />
                                      <select
                                        value={ing.unit}
                                        onChange={(e) => handleIngredientEdit(idx, 'unit', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      >
                                        {Object.values(Unit).map((unit) => (
                                          <option key={unit} value={unit}>
                                            {unit}
                                          </option>
                                        ))}
                                      </select>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          const newIngredients = [...editingIngredients.ingredients];
                                          newIngredients.splice(idx, 1);
                                          setEditingIngredients({
                                            ...editingIngredients,
                                            ingredients: newIngredients
                                          });
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    onClick={() => {
                                      if (!editingIngredients) return;
                                      setEditingIngredients({
                                        ...editingIngredients,
                                        ingredients: [
                                          ...editingIngredients.ingredients,
                                          {
                                            ingredient: ingredients[0]?.name || '',
                                            amount: 0,
                                            unit: Unit.LB
                                          }
                                        ]
                                      });
                                    }}
                                  >
                                    Add Ingredient
                                  </Button>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={handleCloseDialog}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={saveIngredientEdits}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Dialog open={scaleDialogOpen} onOpenChange={setScaleDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startScaling(recipe)}
                              >
                                Scale Recipe
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Scale Recipe - {recipe.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Scale Factor</Label>
                                  <Input
                                    type="number"
                                    value={scaleFactor}
                                    onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                                    min="0.1"
                                    step="0.1"
                                  />
                                </div>
                                {scalingRecipe && (
                                  <div>
                                    <p>New Yield: {Math.round(scalingRecipe.yield * scaleFactor)}</p>
                                    <div className="mt-2">
                                      <Label>Scaled Ingredients:</Label>
                                      <div className="mt-1 space-y-1">
                                        {scalingRecipe.ingredients.map((ing, idx) => (
                                          <div key={idx} className="text-sm">
                                            {(ing.amount * scaleFactor).toFixed(2)} {ing.unit} {ing.ingredient}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setScalingRecipe(null);
                                      setScaleFactor(1);
                                      setScaleDialogOpen(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleScaleRecipe}>
                                    Apply Scaling
                                  </Button>
                                </DialogFooter>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => onDeleteRecipe(index)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ingredients:</Label>
                  <div className="mt-2 space-y-1">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="text-sm">
                        {ing.amount} {ing.unit} {ing.ingredient}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 