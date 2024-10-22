import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";

const OverheadCalculator = ({ recipes, updateRecipe, overheadData, setOverheadData }) => {
  const { rent, utilities, payroll, otherExpenses, profitPercentage } = overheadData;

  const updateOverheadData = (field, value) => {
    setOverheadData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateTotalOverhead = () => {
    return (rent || 0) + (utilities || 0) + (payroll || 0) + (otherExpenses || 0);
  };

  const calculateSuggestedRetailPrice = (recipe) => {
    const totalOverhead = calculateTotalOverhead();
    const totalMonthlySales = recipes.reduce((sum, r) => sum + (r.monthlySales || 0), 0);
    const overheadPerUnit = totalOverhead / (totalMonthlySales || 1); // Avoid division by zero
    const recipeCost = (recipe.cost || 0) / (recipe.yield || 1); // Cost per serving
    const totalCostPerUnit = recipeCost + overheadPerUnit;
    const suggestedPrice = totalCostPerUnit / (1 - ((profitPercentage || 0) / 100));
    return suggestedPrice.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overhead Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rent">Monthly Rent ($)</Label>
            <Input
              id="rent"
              type="number"
              value={rent || ''}
              onChange={(e) => updateOverheadData('rent', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="utilities">Monthly Utilities ($)</Label>
            <Input
              id="utilities"
              type="number"
              value={utilities || ''}
              onChange={(e) => updateOverheadData('utilities', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="payroll">Monthly Payroll ($)</Label>
            <Input
              id="payroll"
              type="number"
              value={payroll || ''}
              onChange={(e) => updateOverheadData('payroll', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="otherExpenses">Other Monthly Expenses ($)</Label>
            <Input
              id="otherExpenses"
              type="number"
              value={otherExpenses || ''}
              onChange={(e) => updateOverheadData('otherExpenses', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="profitPercentage">Desired Profit Percentage (%)</Label>
            <Input
              id="profitPercentage"
              type="number"
              value={profitPercentage || ''}
              onChange={(e) => updateOverheadData('profitPercentage', e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <p>Total Monthly Overhead: ${calculateTotalOverhead().toFixed(2)}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold">Suggested Retail Prices:</h3>
          <ul>
            {recipes.map((recipe, index) => (
              <li key={index} className="flex items-center justify-between my-2">
                <span>
                  {recipe.name}: ${calculateSuggestedRetailPrice(recipe)} 
                  (Yield: {recipe.yield}, Monthly Sales: {recipe.monthlySales})
                </span>
                <Button
                  onClick={() => updateRecipe(index, { ...recipe, suggestedPrice: calculateSuggestedRetailPrice(recipe) })}
                  className="ml-2"
                >
                  Update Price
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverheadCalculator;
