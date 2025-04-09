import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiresGroups }) => {
  const { currentUser, isInGropes, isAdmin } = useAuth();

  // --- Add logging ---
  console.log('ProtectedRoute Rendered:');
  console.log('  currentUser:', !!currentUser);
  console.log('  isAdmin:', isAdmin ? isAdmin() : 'isAdmin function not available');
  console.log('  requiresGroups:', requiresGroups);
  // --- End logging ---
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiresGroups && requiresGroups.length > 0) {
    if (isAdmin()) {
      return <Outlet />;
    } else {
      console.log('  User is NOT admin.');
    }
    
    const hasRequiredGroup = requiresGroups.some(group => isInGropes(group));
    console.log('  Checking required groups. Has required group:', hasRequiredGroup);
    if (!hasRequiredGroup) {
      console.log('  Redirecting to /unauthorized');
      return <Navigate to="/unauthorized" />;
    }
  }
  
  return <Outlet />;
};

export const EditorRouter = () => {
  return <ProtectedRoute requiresGroups={['Editor']} />;
};

export default ProtectedRoute;
