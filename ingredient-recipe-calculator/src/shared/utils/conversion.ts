import { Unit } from '@/features/ingredients/types';

export const convertToOz = (amount: number, unit: Unit): number => {
  switch (unit) {
    case 'lb':
      return amount * 16;
    case 'oz':
      return amount;
    case 'g':
      return amount * 0.035274;
    case 'kg':
      return amount * 35.274;
    case 'cup':
      return amount * 8; // Assuming 1 cup = 8 oz
    case 'tbsp':
      return amount * 0.5; // 1 tbsp = 0.5 oz
    case 'tsp':
      return amount * 0.166667; // 1 tsp = 1/6 oz
    case 'ml':
      return amount * 0.033814; // 1 ml ≈ 0.033814 oz
    case 'l':
      return amount * 33.814; // 1 l = 1000 ml
    case 'piece':
      return amount;
    default:
      return amount;
  }
}; 