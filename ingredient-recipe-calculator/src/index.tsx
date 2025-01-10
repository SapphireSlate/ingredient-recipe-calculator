import React from 'react';
import { createRoot } from 'react-dom/client';
import IngredientRecipeCalculator from '@features/recipes/components/IngredientRecipeCalculator';
import './globals.css';

// Initialize theme
const initializeTheme = () => {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(theme);
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600">Please refresh the page to try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize theme before rendering
initializeTheme();

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <IngredientRecipeCalculator />
    </ErrorBoundary>
  </React.StrictMode>
); 