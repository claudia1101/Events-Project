import React, { useState } from 'react';
import AppBarParticipant from '../components/AppBarParticipant';
import CalendarComponent from '../components/Calendar';
import '../styles/Organizator.css';

const Participant = () => {

  return (
    <div>
      <p className='p1'> Pentru a vedea evenimentele disponibile mergi pe pagina 'Evenimente disponibile' ! </p>
      <AppBarParticipant />
      <CalendarComponent/>
    </div>
  );
};

export default Participant;
