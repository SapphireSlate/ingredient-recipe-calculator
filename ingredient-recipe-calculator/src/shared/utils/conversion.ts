import { Unit } from '@features/ingredients/types';

export const convertToOz = (amount: number, unit: Unit): number => {
  switch (unit) {
    case 'lb':
      return amount * 16;
    case 'oz':
      return amount;
    case 'count':
      return amount;
    default:
      return amount;
  }
}; 