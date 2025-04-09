import React ,{useState} from 'react'
import { Button, TextField, Checkbox, FormControlLabel, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from'react-router-dom';
import { authService } from '../api/services';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
          if (!email || !password || !username) {
            throw new Error('All fields are required.');
          }
          
          const response = await authService.register(username, password, email);
          console.log(response);
          setLoading(false);
          alert('User registered successfully');
          navigate('/login');
        } catch (error) {
          setLoading(false);

          let errorMessage = 'Registration failed';
          
          if (error && error.message) {
            if (typeof error.message === 'string' && error.message.includes('E11000 duplicate key error')) {
              errorMessage = 'Email already exists.';
            } else {
              errorMessage = error.message;
            }
          }
          
          alert(errorMessage);
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
                Register
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
                required
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
            <FormControlLabel
                control={<Checkbox />}
                label="Remember me"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleRegister}
            >
                {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
        </Box>
    )
}

export default Register