export const createAccount = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
      return { success: false, message: 'Username already exists' };
    }
    users[username] = { password, ingredients: [], recipes: [] };
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'Account created successfully' };
  };
  
  export const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username] && users[username].password === password) {
      localStorage.setItem('currentUser', username);
      return { success: true, message: 'Logged in successfully' };
    }
    return { success: false, message: 'Invalid username or password' };
  };
  
  export const logout = () => {
    localStorage.removeItem('currentUser');
  };
  
  export const getCurrentUser = () => {
    return localStorage.getItem('currentUser');
  };
  
  export const saveUserData = (username, ingredients, recipes) => {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
      users[username].ingredients = ingredients;
      users[username].recipes = recipes;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };
  
  export const getUserData = (username) => {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[username] || { ingredients: [], recipes: [] };
  };