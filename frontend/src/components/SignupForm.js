import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function SignUp({ userType }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/register/${userType}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

      if (!response.ok) {
        const responseData = await response.text();
        setSuccess('');
      } else {
        setSuccess('Utilizator înregistrat cu succes!');
        setError('');
      }

    } catch (error) {
      console.error('Eroare la trimiterea cererii:', error);
      setError('A apărut o eroare la înregistrare.');
      setSuccess('');
    }
  };

  
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs" sx={{
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h6" color=" #4caf50" sx={{ mb: 3, fontWeight: 'bold', fontFamily: 'cursive' }}>
           SIGN UP AS {userType}

          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  sx={{
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                  }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  sx={{
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                  }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  sx={{
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                  }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  sx={{
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                  }}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#4caf50',
              }}
            >
              Sign Up
            </Button>
          </Box>

          {error && (
            <Typography variant="body2" color="error" mt={2} align="center">
              {error}
            </Typography>
          )}
          {success && (
            <Typography variant="body2" color="success" mt={2} align="center">
              {success}
            </Typography>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignUp;
