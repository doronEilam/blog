import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const AdminRoute = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!currentUser && isAuthenticated()) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser.isAdmin || currentUser.is_admin;
  if (!isAdmin) {
    return (
      <Box
        sx={{
          maxWidth: '800px',
          margin: '40px auto',
          padding: '20px',
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied
        </Alert>
        <Typography variant="h5" gutterBottom>
          You do not have administrator privileges
        </Typography>
        <Typography variant="body1">
          This area is restricted to administrators only. Please contact the site administration if you believe you should have access.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default AdminRoute;