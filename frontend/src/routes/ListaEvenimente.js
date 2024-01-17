// ListaEvenimente.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/ListaEvenimente.css';
import AppBarParticipant from '../components/AppBarParticipant';

const ListaEvenimente = () => {
  const { participantId } = useUser();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/ListaEvenimente');
        const data = await response.json();
  
        if (response.ok) {
          setEvents(data.events);
        } else {
          console.error('Eroare la preluarea listei de evenimente:', data.error);
        }
      } catch (error) {
        console.error('Eroare la preluarea listei de evenimente:', error);
      }
    };
  
    fetchEvents();
  }, []); 
  

  const handleEventSelection = async (event) => {
    try {
      console.log('participantId:', participantId);
  
      if (!participantId || !event || !event.target || !event.target.id) {
        console.error('IDParticipant sau IDEveniment invalide.');
        return;
      }
  
      const eventId = event.target.id.replace('event-', '');
      console.log('eventId:', eventId);
  
      const checkResponse = await fetch(`http://localhost:8000/ListaEvenimente?idParticipant=${participantId}&idEveniment=${eventId}`);
      const checkData = await checkResponse.json();
  
      if (checkResponse.ok) {
        if (checkData.existaParticipare) {
          console.log('Participantul a fost deja înscris la acest eveniment.');
          return;
        }
      } else {
        console.error('Eroare la verificarea participării:', checkData.error);
        return;
      }
  
      const response = await fetch('http://localhost:8000/ListaEvenimente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idParticipant: participantId,
          idEveniment: eventId,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error('Eroare la salvarea participării:', data.error);
      }
    } catch (error) {
      console.error('Eroare la salvarea participării:', error);
    }
  };
  
  
  

  return (
    <div className="lista">
            <AppBarParticipant />
      <h1 className='h1'>Lista evenimentelor disponibile</h1>
      <h2 className='h2'> Selectează evenimentul la care dorești să participi :</h2>
      <h2 className='h2'> Pentru a te înscrie la evenimentul selectat mergi pe pagina 'Inscriere la eveniment' !</h2>
      <ul className='ulEv'>
        {events.map((event) => (
          <li className='liEv' key={event.id_eveniment}>
            <input
              type="checkbox"
              id={`event-${event.id_eveniment}`}
              onChange={handleEventSelection}
            />
            <label className='labelEv' htmlFor={`event-${event.id_eveniment}`}>
              {`${event.nume_eveniment} - ${event.scheduled_start_time} - ${event.locatie}`}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaEvenimente;