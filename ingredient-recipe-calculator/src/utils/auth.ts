import { User, UserData } from '@/shared/types/user';

// Storage keys
const USERS_STORAGE_KEY = 'recipeCalc_users';
const CURRENT_USER_KEY = 'recipeCalc_currentUser';
const USER_DATA_KEY = 'recipeCalc_userData';

// Load stored data
const loadStoredData = () => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
  const storedUserData = localStorage.getItem(USER_DATA_KEY);

  return {
    users: storedUsers ? JSON.parse(storedUsers) : {},
    currentUser: storedCurrentUser ? JSON.parse(storedCurrentUser) : null,
    userData: storedUserData ? JSON.parse(storedUserData) : {}
  };
};

// Initialize with stored data
const stored = loadStoredData();
let users = stored.users;
let currentUser = stored.currentUser;
let userData = stored.userData;

export const createAccount = async (username: string, password: string): Promise<User> => {
  if (users[username]) {
    throw new Error('Username already exists');
  }
  
  const id = Math.random().toString(36).substr(2, 9);
  const user = { username, password, id };
  users[username] = user;
  userData[username] = {
    ingredients: [],
    recipes: []
  };

  // Save to localStorage
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

  // Automatically log in the new user
  currentUser = { username, id };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
};

export const login = async (username: string, password: string): Promise<User> => {
  const user = users[username];
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password');
  }
  currentUser = { username, id: user.id };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
};

export const logout = async (): Promise<void> => {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  return currentUser;
};

export const saveUserData = async (data: UserData): Promise<void> => {
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  userData[currentUser.username] = data;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const getUserData = async (): Promise<UserData | null> => {
  if (!currentUser) {
    return null;
  }
  return userData[currentUser.username] || {
    ingredients: [],
    recipes: []
  };
}; 