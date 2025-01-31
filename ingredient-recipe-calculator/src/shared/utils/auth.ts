import { User } from '@/shared/types/user';
import { Ingredient } from '@/features/ingredients/types';
import { Recipe } from '@/features/recipes/types';

interface UserData {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

export const createAccount = async (username: string, password: string): Promise<void> => {
  // TODO: Implement actual account creation logic
  localStorage.setItem('user', JSON.stringify({ id: '1', username, createdAt: new Date(), updatedAt: new Date() }));
};

export const login = async (username: string, password: string): Promise<void> => {
  // TODO: Implement actual login logic
  localStorage.setItem('user', JSON.stringify({ id: '1', username, createdAt: new Date(), updatedAt: new Date() }));
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('user');
  localStorage.removeItem('userData');
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const saveUserData = async (data: UserData): Promise<void> => {
  localStorage.setItem('userData', JSON.stringify(data));
};

export const getUserData = async (): Promise<UserData | null> => {
  const dataStr = localStorage.getItem('userData');
  return dataStr ? JSON.parse(dataStr) : null;
}; 