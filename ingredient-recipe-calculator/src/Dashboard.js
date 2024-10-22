import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "./components/ui/card";
import { Select, SelectItem } from "./components/ui/select";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Cell } from 'recharts';

const Dashboard = ({ ingredients = [], recipes = [] }) => {
  const [salesData, setSalesData] = useState([]);
  const [ingredientUsage, setIngredientUsage] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [alertThreshold, setAlertThreshold] = useState(0);
  const [scenarioRecipe, setScenarioRecipe] = useState(null);
  const [scenarioPriceChange, setScenarioPriceChange] = useState(0);
  const [productionQuantity, setProductionQuantity] = useState(0);

  useEffect(() => {
    // Fetch sales data and ingredient usage data
    // This is a placeholder. Replace with actual data fetching logic
    const fetchData = async () => {
      // Placeholder data
      setSalesData([
        { month: 'Jan', sales: 1000 },
        { month: 'Feb', sales: 1500 },
        { month: 'Mar', sales: 1200 },
      ]);

      setIngredientUsage([
        { name: 'Flour', usage: 100 },
        { name: 'Sugar', usage: 50 },
        { name: 'Butter', usage: 30 },
      ]);
    };

    fetchData();
  }, []);

  const calculateProfitMargin = (recipe) => {
    if (!recipe) return 0;
    const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
      const ingredientData = ingredients.find(i => i.name === ingredient.ingredient);
      return sum + (ingredientData ? ingredientData.unitPrice * ingredient.amount : 0);
    }, 0);
    const sellingPrice = recipe.sellingPrice || 0;
    return sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
  };

  const addToSchedule = (recipe, quantity) => {
    if (!recipe || quantity <= 0) return;
    console.log(`Added ${quantity} of ${recipe.name} to schedule`);
    // Implement your scheduling logic here
  };

  const calculateScenario = () => {
    if (!scenarioRecipe || scenarioPriceChange === 0) return null;
    const originalProfit = calculateProfitMargin(scenarioRecipe);
    const newSellingPrice = (scenarioRecipe.sellingPrice || 0) * (1 + scenarioPriceChange / 100);
    const newProfit = newSellingPrice > 0 ? ((newSellingPrice - (scenarioRecipe.totalCost || 0)) / newSellingPrice) * 100 : 0;
    return { originalProfit, newProfit };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No sales data available</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {ingredientUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ingredientUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="usage" fill="#82ca9d">
                        {ingredientUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No ingredient usage data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Margin Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            onValueChange={(value) => setSelectedRecipe(recipes.find(r => r.name === value))} 
            placeholder="Select a recipe"
          >
            {recipes.map(recipe => (
              <SelectItem key={recipe.name} value={recipe.name}>{recipe.name}</SelectItem>
            ))}
          </Select>
          {selectedRecipe && (
            <p className="mt-4">Profit Margin: {calculateProfitMargin(selectedRecipe).toFixed(2)}%</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient Price Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            placeholder="Alert Threshold (%)"
          />
          <ScrollArea className="h-[200px] mt-4">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.name || index} className="flex items-center justify-between py-2">
                <span>{ingredient.name}</span>
                <span className={ingredient.priceChange > alertThreshold ? "text-red-500" : ""}>
                  {(ingredient.priceChange || 0).toFixed(2)}%
                </span>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select 
              onValueChange={(value) => setSelectedRecipe(recipes.find(r => r.name === value))} 
              placeholder="Select a recipe"
            >
              {recipes.map(recipe => (
                <SelectItem key={recipe.name} value={recipe.name}>{recipe.name}</SelectItem>
              ))}
            </Select>
            <Input 
              type="number" 
              placeholder="Quantity" 
              value={productionQuantity}
              onChange={(e) => setProductionQuantity(Number(e.target.value))}
            />
            <Button onClick={() => addToSchedule(selectedRecipe, productionQuantity)}>Add to Schedule</Button>
          </div>
          <ScrollArea className="h-[200px] mt-4">
            {/* Implement your production schedule list here */}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select 
              onValueChange={(value) => setScenarioRecipe(recipes.find(r => r.name === value))}
              placeholder="Select a recipe"
            >
              {recipes.map(recipe => (
                <SelectItem key={recipe.name} value={recipe.name}>{recipe.name}</SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              value={scenarioPriceChange}
              onChange={(e) => setScenarioPriceChange(Number(e.target.value))}
              placeholder="Price Change (%)"
            />
            <Button onClick={calculateScenario}>Calculate Scenario</Button>
          </div>
          {calculateScenario() && (
            <div className="mt-4">
              <p>Original Profit Margin: {calculateScenario().originalProfit.toFixed(2)}%</p>
              <p>New Profit Margin: {calculateScenario().newProfit.toFixed(2)}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
