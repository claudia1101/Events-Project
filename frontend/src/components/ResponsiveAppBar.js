import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';

const pages = ['Acasă'];
const accountOptions = ['Participant', 'Organizator'];
const ResponsiveAppBar = ({ onAccountTypeClick, onLoginClick, navigate }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElAccount, setAnchorElAccount] = React.useState(null);
  const [anchorElLogin, setAnchorElLogin] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    console.log('Opening nav menu');
    setAnchorElNav(event.currentTarget);
  };
  

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenAccountMenu = (event) => {
    setAnchorElAccount(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseAccountMenu = () => {
    setAnchorElAccount(null);
  };

  const handleAccountTypeClick = (accountType) => {
    onAccountTypeClick(accountType);

    if (accountType === 'Participant') {
      navigate('/register/Participant');
    } else if (accountType === 'Organizator') {
      navigate('/register/Organizator');
    }

    handleCloseAccountMenu();
  };

  const handleOpenLoginMenu = (event) => {
    setAnchorElLogin(event.currentTarget);
  };
  
  const handleCloseLoginMenu = () => {
    setAnchorElLogin(null);
  };
  
  const handleLoginTypeClick = (loginType) => {
    onLoginClick(loginType);
  
    if (loginType === 'Participant') {
      navigate('/login/Participant');
    } else if (loginType === 'Organizator') {
      navigate('/login/Organizator');
    }
  
    handleCloseLoginMenu();
  };
  
  

  return (
    <AppBar color="primary" sx={{ backgroundColor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img
            src={process.env.PUBLIC_URL + '/logo.jpg'}
            alt="Logo"
            style={{ marginRight: '8px', width: '110px', height: '60px' }}
          />

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="#000000"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                marginTop: '0px',
              }}
            >
 

              <MenuItem onClick={handleOpenAccountMenu}>
                <Typography textAlign="center">Creare cont</Typography>
              </MenuItem>
              <MenuItem onClick={handleOpenLoginMenu}>
                <Typography textAlign="center">LogIn</Typography>
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'black', display: 'block'}}
              >
                {page}
              </Button>
            ))}
            <Button
              key="Contact"
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'black', display: 'block'}}
            >
              <Link to="/Contact" style={{ textDecoration: 'none', color: 'black' }}>
                Contact
              </Link>
            </Button>


            <Button onClick={handleOpenAccountMenu} sx={{ my: 2, color: 'black', display: 'block' }}>
              Creare cont
            </Button>
            <Button onClick={handleOpenLoginMenu} sx={{ my: 2, color: 'black', display: 'block' }}>
  LogIn
</Button>

          </Box>

          <Box sx={{ flexGrow: 0 }}>

            <Menu
              sx={{ mt: '0px' }}
              id="menu-appbar-account"
              anchorEl={anchorElAccount}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElAccount)}
              onClose={handleCloseAccountMenu}
            >
              {accountOptions.map((accountOption) => (
                <MenuItem
                  key={accountOption}
                  onClick={() => handleAccountTypeClick(accountOption)}
                >
                  <Typography textAlign="center">{accountOption}</Typography>
                </MenuItem>
              ))}
            </Menu>

            <Menu
              sx={{ mt: '0px' }}
              id="menu-appbar-login-options"
              anchorEl={anchorElLogin}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal:'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal:'left'
              }}
              open={Boolean(anchorElLogin)}
              onClose={handleCloseLoginMenu}
            >

              {accountOptions.map((loginOption) => (
                <MenuItem
                  key={'login_' + loginOption}
                  onClick={() => handleLoginTypeClick(loginOption)}
                >
                  <Typography textAlign="center">{loginOption}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
