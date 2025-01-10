export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserData {
  ingredients: any[]; // Will be replaced with proper types
  recipes: any[]; // Will be replaced with proper types
} 