import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/ListaParticipanti.css';
import { Link } from 'react-router-dom';

const ListaParticipanti = () => {
  const { organizatorId } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/Evenimente?organizatorId=${organizatorId}`);
      const data = await response.json();
  
      const upcomingEvents = data.events
        .filter((event) => new Date(event.scheduled_start_time) >= today)
        .map((event) => ({ ...event, codes: [], organizatorId }));
  
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Eroare la fetchEvents:', error);
    }
  };
  
  const fetchParticipants = async (eventId) => {
    try {
      if (!eventId) {
        setParticipants([]);
        return;
      }
  
      const response = await fetch(`http://localhost:8000/ListaParticipanti?idOrganizator=${organizatorId}&idEveniment=${eventId}`);
      const data = await response.json();
  
      const presentParticipants = data.participants.filter(participant => participant.prezenta === 1);
      setParticipants(presentParticipants);
      console.log(presentParticipants);
    } catch (error) {
      console.error('Eroare la fetchParticipants:', error);
    }
  };
  
  const handleEventButtonClick = (event) => {
    setSelectedEvent(event);
    fetchParticipants(event.id_eveniment);
  };
  
  
  useEffect(() => {
    if (organizatorId) {
      fetchEvents();
    }
  }, [organizatorId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (
    <div className='div'>
      <h1 className='h1p'>Participanți prezenți la evenimente</h1>
      {events.length === 0 ? (
        <p>Nu există evenimente disponibile.</p>
      ) : (
        <div>
          <h2 className='h2p'>Lista evenimentelor:</h2>
          <ul>
            {events.map((event) => (
              <li className='liParticip' key={event.id_eveniment}>
                {event.nume_eveniment} - {event.scheduled_start_time}
                <button className='buton' onClick={() => handleEventButtonClick(event)}>
                  Vezi Participanții
                </button>
                {selectedEvent && selectedEvent.id_eveniment === event.id_eveniment && (
                <ul>
                  {participants.map((participant) => (
                    <li key={participant.id_participant}>
                      {participant.nume} {participant.prenume}
                    </li>
                  ))}
                </ul>
              )}
              </li>
            ))}
            
          </ul>
          
        </div>
        
      )}
       <Link to="/Fisier">
          <button className='b'>Exportează participanții</button>
        </Link>
    </div>
  );
};

export default ListaParticipanti;
