import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe } from '@/features/recipes/types';

interface Props {
  onOverheadCostChange: (cost: number) => void;
  recipes: Recipe[];
  calculateRecipeCost: (recipe: Recipe) => number;
}

export const OverheadCalculator: React.FC<Props> = ({ 
  onOverheadCostChange, 
  recipes,
  calculateRecipeCost 
}) => {
  const [rent, setRent] = useState<string>('');
  const [utilities, setUtilities] = useState<string>('');
  const [labor, setLabor] = useState<string>('');
  const [other, setOther] = useState<string>('');
  const [profitMargin, setProfitMargin] = useState<string>('30'); // Default 30% profit margin

  const total = useMemo(() => {
    return [rent, utilities, labor, other]
      .map(value => Number(value) || 0)
      .reduce((sum, value) => sum + value, 0);
  }, [rent, utilities, labor, other]);

  useEffect(() => {
    onOverheadCostChange(total);
  }, [total, onOverheadCostChange]);

  const suggestedPrices = useMemo(() => {
    const totalMonthlySales = recipes.reduce((sum, recipe) => sum + recipe.monthlySales, 0);
    
    return recipes.map(recipe => {
      const ingredientCost = calculateRecipeCost(recipe);
      const recipePortionOfSales = recipe.monthlySales / (totalMonthlySales || 1);
      const overheadPerMonth = total * recipePortionOfSales;
      const overheadPerBatch = overheadPerMonth / (recipe.monthlySales || 1);
      const totalCostPerBatch = ingredientCost + overheadPerBatch;
      const costPerServing = totalCostPerBatch / recipe.yield;
      const profitMultiplier = 1 + (Number(profitMargin) / 100);
      const suggestedPrice = costPerServing * profitMultiplier;

      return {
        recipe,
        ingredientCost,
        overheadPerBatch,
        costPerServing,
        suggestedPrice
      };
    });
  }, [recipes, calculateRecipeCost, total, profitMargin]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overhead Cost Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="rent">Monthly Rent</Label>
                <Input
                  id="rent"
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="Enter monthly rent"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="utilities">Monthly Utilities</Label>
                <Input
                  id="utilities"
                  type="number"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  placeholder="Enter monthly utilities"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="labor">Monthly Labor</Label>
                <Input
                  id="labor"
                  type="number"
                  value={labor}
                  onChange={(e) => setLabor(e.target.value)}
                  placeholder="Enter monthly labor cost"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="other">Other Monthly Costs</Label>
                <Input
                  id="other"
                  type="number"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="Enter other monthly costs"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="profit-margin">Desired Profit Margin (%)</Label>
              <Input
                id="profit-margin"
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="Enter desired profit margin"
                min="0"
                max="100"
              />
            </div>
            <div className="pt-4">
              <p className="text-lg font-semibold">
                Total Monthly Overhead: ${total.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Price Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-6">
              {suggestedPrices.map(({
                recipe,
                ingredientCost,
                overheadPerBatch,
                costPerServing,
                suggestedPrice
              }) => (
                <div key={recipe.name} className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ingredient Cost (per batch)</p>
                      <p className="font-medium">${ingredientCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overhead (per batch)</p>
                      <p className="font-medium">${overheadPerBatch.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost per Serving</p>
                      <p className="font-medium">${costPerServing.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Suggested Price</p>
                      <p className="font-medium text-green-600">${suggestedPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Monthly Sales: {recipe.monthlySales} batches | Yield per Batch: {recipe.yield} servings</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}; 