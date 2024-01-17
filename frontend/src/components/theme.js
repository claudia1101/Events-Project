import { createTheme } from '@mui/material/styles';
import backgroundImage from 'C:/Users/mierl/OneDrive/Desktop/Facultate/AN 3/Proiecte/Proiect tehnologii/Events Project - Copy/frontend/src/joanna-kosinska-9gfGDbxuqrU-unsplash.jpg'; // Asigură-te că calea este corectă

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  },
});

export default theme;
