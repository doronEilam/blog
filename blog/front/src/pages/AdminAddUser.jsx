import React, { useState, useEffect } from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Typography, Box, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/services/adminService';

const AddUser = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await adminService.getGroups();
                setGroups(response || []);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            }
        };

        fetchGroups();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!password || !username) {
                throw new Error('Username and password are required.');
            }

            const response = await adminService.addUser({
                username,
                password,
                email: email || null,
                groups: selectedGroups,
            });
            console.log(response);
            setLoading(false);
            alert('User added successfully');
            navigate('/admin/users');
        } catch (error) {
            setLoading(false);
            alert(error.message || 'Failed to add user.');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <Typography variant="h4" gutterBottom>
                Add User
            </Typography>
            <TextField
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
            />
            <TextField
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />
            <TextField
                label="Password"
                variant="outlined"
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="groups-label">Groups</InputLabel>
                <Select
                    labelId="groups-label"
                    multiple
                    value={selectedGroups}
                    onChange={(e) => setSelectedGroups(e.target.value)}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {groups.map((group) => (
                        <MenuItem key={group.id} value={group.name}>
                            <Checkbox checked={selectedGroups.includes(group.name)} />
                            {group.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddUser}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Add User'}
            </Button>
        </Box>
    );
};

export default AddUser;