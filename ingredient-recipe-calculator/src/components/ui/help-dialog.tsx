import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { HelpCircle } from 'lucide-react';

export const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-6 w-6" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>How to Use the Recipe Calculator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <p className="text-muted-foreground mb-4">
                Welcome to the Recipe Calculator! This tool helps you manage your recipes, ingredients, and calculate costs. 
                Here's a simple guide to help you get started.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Ingredients Tab</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>This is where you manage all your ingredients. You can:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Add new ingredients one by one</li>
                  <li>Import multiple ingredients from an Excel file</li>
                  <li>Edit existing ingredients</li>
                  <li>Delete ingredients you no longer need</li>
                </ul>
                <p className="mt-2"><strong>Tip:</strong> When importing from Excel, make sure your file has these columns:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name - What the ingredient is called</li>
                  <li>Price - How much it costs</li>
                  <li>Amount - How much you get for that price</li>
                  <li>Unit - The measurement unit (like lb, oz, etc.)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Recipes Tab</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Here you can create and manage your recipes. You can:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Create new recipes with multiple ingredients</li>
                  <li>Set how many servings each recipe makes</li>
                  <li>Add preparation time and shelf life</li>
                  <li>Scale recipes up or down as needed</li>
                  <li>Edit recipe details anytime</li>
                </ul>
                <p className="mt-2"><strong>Tip:</strong> Use the "Scale Recipe" button to easily adjust recipe quantities for different batch sizes.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Overhead Tab</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>This section helps you track additional costs beyond ingredients. You can:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Add utility costs (electricity, water, etc.)</li>
                  <li>Include labor costs</li>
                  <li>Add any other business expenses</li>
                  <li>See how overhead affects your recipe costs</li>
                </ul>
                <p className="mt-2"><strong>Tip:</strong> Don't forget to update these costs regularly to keep your calculations accurate.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Production Planning Tab</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Plan your production schedule and manage inventory here. You can:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Schedule what to make and when</li>
                  <li>Get shopping lists for ingredients you need</li>
                  <li>See preparation schedules</li>
                  <li>Track how much of each recipe to make</li>
                </ul>
                <p className="mt-2"><strong>Tip:</strong> Use this to plan ahead and make sure you have all ingredients needed for upcoming production.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Common Tasks</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="font-medium">How to Add a New Recipe:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to the Recipes tab</li>
                  <li>Click "Add New Recipe"</li>
                  <li>Fill in the recipe name and details</li>
                  <li>Add ingredients one by one</li>
                  <li>Save your recipe</li>
                </ol>

                <p className="font-medium mt-4">How to Import Ingredients:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to the Ingredients tab</li>
                  <li>Click "Import from Excel"</li>
                  <li>Choose your Excel file</li>
                  <li>Review any duplicate ingredients</li>
                  <li>Confirm the import</li>
                </ol>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>If you encounter any problems or have suggestions for improvement:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email: sapphireproductions2020@gmail.com</li>
                  <li>Please include:</li>
                  <ul className="list-circle pl-6 space-y-1">
                    <li>Screenshots or videos showing the issue</li>
                    <li>Steps to reproduce the problem</li>
                    <li>What you expected to happen</li>
                    <li>What actually happened</li>
                  </ul>
                </ul>
                <p className="mt-4 text-sm italic">Your feedback helps make this tool better for everyone!</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 