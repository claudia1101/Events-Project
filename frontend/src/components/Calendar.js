import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import '../styles/Calendar.css';

const CalendarComponent = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState([]);
  const { participantId } = useUser();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`http://localhost:8000/Participari?idParticipant=${participantId}`);
        const data = await response.json();

        const presentParticipants = data.events || []; 

        const eventsArray = presentParticipants.map(participant => ({
          title: participant.nume_eveniment, 
          start: moment(participant.scheduled_start_time), 
          end: moment(participant.scheduled_start_time).add(participant.duration, 'minutes'),
        }));
        
        setEvents(eventsArray);
      } catch (error) {
        console.error('Eroare la fetchParticipants:', error);
      }
    };

    fetchParticipants();
  }, [participantId]); 
  return (
    <div >
      <Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  style={{ height: 600 }}
  eventPropGetter={(event, start, end, isSelected) => {
    const backgroundColor = isSelected ? '#55C4AC' : '#EAE66E';
    const borderColor = '#000000' ;
    return { style: { backgroundColor, borderColor } };
  }}
  className="custom-calendar"
/>
    </div>
  );
};

export default CalendarComponent;
