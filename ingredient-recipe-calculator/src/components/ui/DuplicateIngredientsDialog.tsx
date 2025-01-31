import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Ingredient } from '../../features/ingredients/types';

interface DuplicateIngredient {
  existing: Ingredient;
  new: Ingredient;
  action: 'keep' | 'replace' | undefined;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateIngredient[];
  onResolve: (resolvedDuplicates: DuplicateIngredient[]) => void;
}

export const DuplicateIngredientsDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  duplicates,
  onResolve,
}) => {
  const [localDuplicates, setLocalDuplicates] = React.useState<DuplicateIngredient[]>(duplicates);

  // Reset local state when duplicates prop changes
  React.useEffect(() => {
    setLocalDuplicates(duplicates);
  }, [duplicates]);

  const handleKeepAll = () => {
    const updated = localDuplicates.map(dup => ({ ...dup, action: 'keep' as const }));
    setLocalDuplicates(updated);
  };

  const handleReplaceAll = () => {
    const updated = localDuplicates.map(dup => ({ ...dup, action: 'replace' as const }));
    setLocalDuplicates(updated);
  };

  const handleToggle = (index: number, action: 'keep' | 'replace') => {
    const updated = [...localDuplicates];
    updated[index] = {
      ...updated[index],
      action: updated[index].action === action ? undefined : action,
    };
    setLocalDuplicates(updated);
  };

  const handleResolve = () => {
    onResolve(localDuplicates);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Duplicate Ingredients Found</DialogTitle>
          <DialogDescription>
            Some ingredients in your Excel file already exist in your list.
            Please choose which version to keep for each ingredient.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Button variant="outline" onClick={handleKeepAll}>Keep All Existing</Button>
          <Button variant="outline" onClick={handleReplaceAll}>Replace All with New</Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {localDuplicates.map((duplicate, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{duplicate.existing.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`keep-${index}`}
                        checked={duplicate.action === 'keep'}
                        onCheckedChange={() => handleToggle(index, 'keep')}
                      />
                      <Label htmlFor={`keep-${index}`}>Keep Existing</Label>
                    </div>
                    <div className="text-sm space-y-1 ml-6">
                      <p>Price: ${duplicate.existing.price}</p>
                      <p>Amount: {duplicate.existing.amount} {duplicate.existing.unit}</p>
                      <p>Category: {duplicate.existing.category}</p>
                      <p>Unit Price: ${duplicate.existing.unitPrice.toFixed(2)}/oz</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`replace-${index}`}
                        checked={duplicate.action === 'replace'}
                        onCheckedChange={() => handleToggle(index, 'replace')}
                      />
                      <Label htmlFor={`replace-${index}`}>Use New</Label>
                    </div>
                    <div className="text-sm space-y-1 ml-6">
                      <p>Price: ${duplicate.new.price}</p>
                      <p>Amount: {duplicate.new.amount} {duplicate.new.unit}</p>
                      <p>Category: {duplicate.new.category}</p>
                      <p>Unit Price: ${duplicate.new.unitPrice.toFixed(2)}/oz</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleResolve}
            disabled={localDuplicates.some(d => !d.action)}
          >
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 