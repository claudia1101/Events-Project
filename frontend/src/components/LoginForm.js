// LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

function LoginForm({ userType }) {
  const navigate = useNavigate();
  const { setOrganizatorId } = useUser();
  const { setParticipantId } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    selectedOrganizatorId: undefined, 
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:8000/login/${userType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        console.error('Autentificare esuata.');
      } else {
        const responseData = await response.json();
        
        setOrganizatorId(responseData.organizatorId); 
        setParticipantId(responseData.participantId);
  
        if (userType === 'Organizator') {
          navigate('/Organizator', { state: { organizatorId: responseData.organizatorId } });
        } else if (userType === 'Participant') {
          navigate('/Participant');
        }
      }
    } catch (error) {
      console.error('Eroare la trimiterea cererii:', error);
    }
  };
  
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  return (
    <Container component="main" maxWidth="md" sx={{
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      marginTop:'220px',
}}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          
          }}
        >
          <Typography component="h1" variant="h6" color="#4caf50" sx={{ mb: 3, fontWeight: 'bold', fontFamily: 'cursive' }}>
            LOGIN AS {userType}
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
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
                  autoComplete="current-password"
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
              Login
            </Button>
          </Box>

        </Box>
      </Container>
  );
}

export default LoginForm;
