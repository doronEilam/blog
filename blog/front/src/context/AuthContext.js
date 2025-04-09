import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import { getAccessToken, removeTokens } from '../api/utils/tokenStorge';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = () => localStorage.getItem('is_admin') === 'true';
  const isSuperuser = () => localStorage.getItem('is_superuser') === 'true';
  const isAuthenticated = () => !!getAccessToken();

  const isInGropes = (groupName) => {
    const groupsString = localStorage.getItem('user_groups');
    if (!groupsString) return false;

    try {
      const groups = JSON.parse(groupsString);
      return groups.some(group => group.name === groupName);
    } catch {
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      setError('');
      const response = await authService.login(username, password);

      const user = {
        ...response,
        isAdmin: response.is_admin,
        isSuperuser: response.is_superuser,
        token: response.access,
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('is_admin', String(user.isAdmin));
      localStorage.setItem('is_superuser', String(user.isSuperuser));
      if (response.groups?.length > 0) {
        localStorage.setItem('user_groups', JSON.stringify(response.groups));
      }

      return user;
    } catch (err) {
      setError('Failed to log in: ' + err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Define all keys used by the app in localStorage
      const keysToRemove = [
        'authToken',       // From tokenStorge.js
        'refreshToken',    // From tokenStorge.js
        'is_admin',
        'is_superuser',
        'currentUser',
        'user_groups'
      ];

      console.log('Logout initiated. Attempting to remove keys:', keysToRemove);

      // Remove each key
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage.`); // Confirm removal
      });

      // Set state to null
      setCurrentUser(null);
      console.log('Logout process finished.');

    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error, try to clear state
      setCurrentUser(null);
    }
  };

  const signup = async (username, password, email) => {
    try {
      setError('');
      return await authService.register(username, password, email);
    } catch (err) {
      setError('Failed to create account: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const token = getAccessToken();
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const savedUserString = localStorage.getItem('currentUser');
        if (savedUserString) {
          try {
            const savedUser = JSON.parse(savedUserString);
            if (savedUser.token === token) {
              setCurrentUser(savedUser);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem('currentUser');
          }
        }

        try {
          const response = await authService.getUserProfile();
          // Assuming getUserProfile returns the user object which includes groups
          const user = {
            id: response.id,
            username: response.username,
            email: response.email,
            isAdmin: response.is_staff, // Use is_staff for admin check
            isSuperuser: response.is_superuser,
            groups: response.groups || [], // Ensure groups array exists
            token,
          };
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('is_admin', String(user.isAdmin));
          localStorage.setItem('is_superuser', String(user.isSuperuser));
          // Store groups fetched from profile
          if (user.groups.length > 0) {
            // Assuming response.groups is an array of group objects {id, name}
            // If it's just IDs, adjust accordingly or fetch group details if needed
            localStorage.setItem('user_groups', JSON.stringify(user.groups));
          } else {
             localStorage.removeItem('user_groups'); // Clear if no groups
          }
        } catch (profileError) {
          console.error("Error fetching user profile during session restore:", profileError);
          await logout(); // Logout if profile fetch fails
        }
      } catch {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    signup,
    error,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperuser,
    isInGropes,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
