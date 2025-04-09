import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllUsers, deleteUser, getAllGroups } from '../api/services/adminService';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupsMap, setGroupsMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const usersData = await getAllUsers();
        setUsers(usersData || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(err.message || 'Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getAllGroups();
        const map = {};
        groupsData.forEach(group => {
          map[group.id] = group.name;
        });
        setGroupsMap(map);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    fetchGroups();
  }, []);

  const handleEditUser = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await deleteUser(userId);
        setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        alert('User deleted successfully!');
      } catch (err) {
        console.error(`Failed to delete user ${userId}:`, err);
        setError(err.message || `Failed to delete user ${userId}. Please try again.`);
        alert(err.message || `Failed to delete user ${userId}.`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="manage users table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Groups</TableCell>
              <TableCell>Is Admin</TableCell>
              <TableCell>Is Superuser</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.groups && Array.isArray(user.groups) && user.groups.length > 0
                      ? user.groups.map(groupId => groupsMap[groupId]).join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{user.is_staff ? "Yes" : "No"}</TableCell>
                  <TableCell>{user.is_superuser ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton onClick={() => handleEditUser(user.id)} size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton onClick={() => handleDeleteUser(user.id)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ManageUsers;
