import React, { useState, useEffect } from 'react';
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectItem } from "./select";
import { Button } from "./button";

const BusinessOverheadCalculator = ({ onCalculate, initialValues }) => {
  const [rent, setRent] = useState(initialValues.rent || 0);
  const [utilities, setUtilities] = useState(initialValues.utilities || 0);
  const [wages, setWages] = useState(initialValues.wages || 0);
  const [otherExpenses, setOtherExpenses] = useState(initialValues.otherExpenses || 0);
  const [avgProductionVolume, setAvgProductionVolume] = useState(initialValues.avgProductionVolume || 0);
  const [avgBatches, setAvgBatches] = useState(initialValues.avgBatches || 0);
  const [productionUnit, setProductionUnit] = useState(initialValues.productionUnit || 'items');
  const [targetProfitMargin, setTargetProfitMargin] = useState(initialValues.targetProfitMargin || 0.2);

  useEffect(() => {
    calculateOverhead();
  }, [rent, utilities, wages, otherExpenses, avgProductionVolume, avgBatches, productionUnit, targetProfitMargin]);

  const calculateOverhead = () => {
    const totalMonthlyExpenses = rent + utilities + wages + otherExpenses;
    const overheadPerUnit = totalMonthlyExpenses / (productionUnit === 'items' ? avgProductionVolume : avgBatches);
    onCalculate({
      rent,
      utilities,
      wages,
      otherExpenses,
      avgProductionVolume,
      avgBatches,
      productionUnit,
      targetProfitMargin,
      overheadPerUnit
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rent">Monthly Rent</Label>
        <Input
          id="rent"
          type="number"
          value={rent}
          onChange={(e) => setRent(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="utilities">Monthly Utilities</Label>
        <Input
          id="utilities"
          type="number"
          value={utilities}
          onChange={(e) => setUtilities(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="wages">Monthly Wages</Label>
        <Input
          id="wages"
          type="number"
          value={wages}
          onChange={(e) => setWages(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="otherExpenses">Other Monthly Expenses</Label>
        <Input
          id="otherExpenses"
          type="number"
          value={otherExpenses}
          onChange={(e) => setOtherExpenses(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="avgProductionVolume">Average Monthly Production Volume</Label>
        <Input
          id="avgProductionVolume"
          type="number"
          value={avgProductionVolume}
          onChange={(e) => setAvgProductionVolume(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="avgBatches">Average Monthly Batches</Label>
        <Input
          id="avgBatches"
          type="number"
          value={avgBatches}
          onChange={(e) => setAvgBatches(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="productionUnit">Production Unit</Label>
        <Select 
          value={productionUnit} 
          onChange={setProductionUnit}
          placeholder="Select unit"
        >
          <SelectItem value="items">Items</SelectItem>
          <SelectItem value="batches">Batches</SelectItem>
        </Select>
      </div>
      <div>
        <Label htmlFor="targetProfitMargin">Target Profit Margin (%)</Label>
        <Input
          id="targetProfitMargin"
          type="number"
          value={targetProfitMargin * 100}
          onChange={(e) => setTargetProfitMargin(Number(e.target.value) / 100)}
        />
      </div>
      <Button onClick={calculateOverhead}>Calculate Overhead</Button>
    </div>
  );
};

export default BusinessOverheadCalculator;