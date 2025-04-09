import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  FormControl,
  RadioGroup,
  Radio
} from '@mui/material';
import { getUserById, updateUser, getAllGroups } from '../api/services/adminService'; 

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    is_staff: false,
    groups: [],
  });
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [userData, groupsData] = await Promise.all([
        getUserById(userId),
        getAllGroups()
      ]);

      setUser(userData || {});
      setAllGroups(groupsData || []);

      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        is_staff: userData.is_staff || false,
      });

      if (userData.groups && userData.groups.length > 0) {
        setSelectedGroupId(userData.groups[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch user data or groups:", err);
      setError(err.message || 'Failed to load user data or groups.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ...formData,
        groups: [selectedGroupId],
      };
      await updateUser(userId, updatedUser);
      setSuccess('User updated successfully.');
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      setError(error.message || 'Failed to update user.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">User data not found.</Alert>
        <Button variant="outlined" onClick={() => navigate('/admin/users')} sx={{ mt: 2 }}>
          Back to User List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit User: {user.username} (ID: {userId})
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="first_name"
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="last_name"
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
 
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend">Assign Group</FormLabel>
            <RadioGroup
              row
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            >
              {allGroups.length > 0 ? (
                allGroups.map((group) => (
                  <FormControlLabel
                    key={group.id}
                    value={group.id}
                    control={<Radio />}
                    label={group.name}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No groups available.
                </Typography>
              )}
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/admin/users')}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditUser;
