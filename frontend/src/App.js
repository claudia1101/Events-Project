// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './routes/HomePage';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import Organizator from './routes/Organizator';
import Participant from './routes/Participant';
import AddEvents from './routes/AddEvents';
import { UserProvider } from './context/UserContext';
import Evenimente from './routes/Evenimente';
import ListaEvenimente from './routes/ListaEvenimente';
import ListaParticipanti from './routes/ListaParticipanti';
import InscriereEvenimente from './routes/InscriereEveniment';
import { EventProvider } from './context/EventsContext';
import Contact from './routes/Contact';
import Fisier from './routes/Fisier';
function App() {
  return (
    <Router>
      <UserProvider>
      <EventProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register/Participant" element={<SignupForm userType="Participant" />} />
          <Route path="/register/Organizator" element={<SignupForm userType="Organizator" />} />
          <Route path="/login/Organizator" element={<LoginForm userType="Organizator" />} />
          <Route path="/login/Participant" element={<LoginForm userType="Participant" />} />
          <Route path="/Organizator" element={<Organizator />} />
          <Route path="/Participant" element={<Participant />} />
          <Route path="/AddEvents" element={<AddEvents />} />
          <Route path="/Evenimente" element={<Evenimente />} />
          <Route path="/ListaEvenimente" element={<ListaEvenimente />} />
          <Route path="/ListaParticipanti" element={<ListaParticipanti />} />
          <Route path="/InscriereEvenimente" element={<InscriereEvenimente />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Fisier" element={<Fisier />} />
        </Routes>
        </EventProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
