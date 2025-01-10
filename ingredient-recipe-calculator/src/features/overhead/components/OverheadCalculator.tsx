import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

interface Props {
  onOverheadCostChange: (cost: number) => void;
}

export const OverheadCalculator: React.FC<Props> = ({ onOverheadCostChange }) => {
  const [rent, setRent] = useState<string>('');
  const [utilities, setUtilities] = useState<string>('');
  const [labor, setLabor] = useState<string>('');
  const [other, setOther] = useState<string>('');

  const calculateTotal = () => {
    const total = [rent, utilities, labor, other]
      .map(value => Number(value) || 0)
      .reduce((sum, value) => sum + value, 0);
    onOverheadCostChange(total);
    return total;
  };

  return (
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
              />
            </div>
          </div>
          <div className="pt-4 text-center sm:text-left">
            <p className="text-lg sm:text-xl font-semibold">
              Total Monthly Overhead: ${calculateTotal().toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 