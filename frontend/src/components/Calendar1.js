import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import '../styles/Calendar.css';

const CalendarComponent1 = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState([]);
  const { organizatorId } = useUser();

  useEffect(() => {
    const fetchOrganizatorEvents = async () => {
      try {
        if (!organizatorId) {
          console.error('ID-ul organizatorului lipsește.');
          return;
        }

        const response = await fetch(`http://localhost:8000/Evenimente?organizatorId=${organizatorId}`);
        const data = await response.json();

        const organizatorEvents = data.events || [];

        const eventsArray = [];

        organizatorEvents.forEach((event) => {
          const recurrenceRule = {
            daily: 'days',
            weekly: 'weeks',
            monthly: 'months',
          }[event.repetitie_tip];

          if (event.repetitie_tip && event.repetitie_interval) {
            const startDate = moment(event.scheduled_start_time);
            let currentDate = moment(startDate);
            const eventEndDate = moment(currentDate).add(event.duration, 'minutes');
            const seriesEndDate = moment(currentDate).add(1, 'year'); 

            while (currentDate.isBefore(seriesEndDate)) {
              const adjustedEnd = moment.min(eventEndDate, moment(seriesEndDate));

              eventsArray.push({
                title: event.nume_eveniment,
                start: currentDate.toDate(),
                end: adjustedEnd.toDate(),
              });

              currentDate = moment(currentDate).add(
                event.repetitie_tip === 'monthly' ? event.repetitie_interval : 1,
                recurrenceRule
              );
            }
          } else {
            eventsArray.push({
              title: event.nume_eveniment,
              start: new Date(event.scheduled_start_time),
              end: moment(new Date(event.scheduled_start_time)).add(event.duration, 'minutes').toDate(),
            });
          }
        });

        setEvents(eventsArray);
      } catch (error) {
        console.error('Eroare la fetchOrganizatorEvents:', error);
      }
    };

    fetchOrganizatorEvents();
  }, [organizatorId]);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={(event, start, end, isSelected) => {
          const backgroundColor = isSelected ? '#55C4AC' : '#EAE66E';
          const borderColor = '#000000';
          return { style: { backgroundColor, borderColor } };
        }}
        className="custom-calendar"
      />
    </div>
  );
};

export default CalendarComponent1;
