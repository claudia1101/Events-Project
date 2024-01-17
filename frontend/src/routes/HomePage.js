import React, { useState } from 'react';
import Container from '@mui/material/Container';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import '../styles/HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const navigate = useNavigate();

  const handleAccountTypeClick = (accountType) => {
    setSelectedAccountType(accountType);
  };

  const handleLoginClick = (loginType) => {
    console.log(`Login type clicked: ${loginType}`);
  };

  return (
    <div>
      <ResponsiveAppBar onAccountTypeClick={handleAccountTypeClick} onLoginClick={handleLoginClick} navigate={navigate} />


      <Container component="main" style={{ textAlign: 'center' }}>
        <div className='divHP'>
          <h1 className='titluHP'>Bun venit pe EventSphere!</h1>
          <p className='descriereHP'>EventSphere este aplicația perfectă pentru organizatorii de evenimente care doresc să gestioneze cu eficiență și să monitorizeze participanții la evenimente, dar și pentru participanții care doresc să își aleagă ușor un eveniment la care să participe.</p>

          <ul className="image-list">
            <li><img  src={process.env.PUBLIC_URL + '/image1.jpeg'} style={{ width: '300px' }} /></li>
            <li><img  src={process.env.PUBLIC_URL + '/image2.jpg'} style={{ width: '300px' }}/></li>
            <li><img  src={process.env.PUBLIC_URL + '/image3.jpg'} style={{ width: '300px' }}/></li>
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
