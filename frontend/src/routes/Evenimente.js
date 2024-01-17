import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useUser } from '../context/UserContext';
import { useEventContext } from '../context/EventsContext';
import '../styles/Evenimente.css';

const Evenimente = () => {
  const { organizatorId } = useUser();
  const { events, setEvents, popups, setPopups } = useEventContext();
  const [zoomedQR, setZoomedQR] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!organizatorId) {
          console.error('Id-ul organizatorului nu este disponibil.');
          return;
        }

        const response = await fetch(`http://localhost:8000/Evenimente?organizatorId=${organizatorId}`);
        const data = await response.json();

        if (data && data.events) {
          const currentDateTime = new Date(); 

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcomingEvents = data.events
            .filter((event) => new Date(event.scheduled_start_time) >= today)
            .map((event) => {
              const existingEvent = events.find((e) => e.id_eveniment === event.id_eveniment);
              return existingEvent ? existingEvent : { ...event, codes: [], organizatorId };
            });
          
        


          setEvents(upcomingEvents);

          const initialPopups = {};
          upcomingEvents.forEach((event) => {
            initialPopups[event.id_eveniment] = false;
          });
          setPopups(initialPopups);
        } else {
          console.error('Răspuns invalid de la server');
        }
      } catch (error) {
        console.error('Eroare la preluarea evenimentelor:', error);
      }
    };

    fetchEvents();
  }, [organizatorId, setEvents, setPopups]);

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(7);
  };

  const handleGenerateCodes = (event) => {
    const textCode = generateUniqueCode();
    const qrCodeURL = textCode; 
    
    console.log('Generated QR Code:', qrCodeURL); 


    setEvents((prevEvents) => {
      return prevEvents.map((e) =>
        e.id_eveniment === event.id_eveniment
          ? {
              ...e,
              codes: [...e.codes, { textCode, qrCodeURL }],
            }
          : e
      );
    });

    setPopups((prevPopups) => {
      console.log('Updated Popups:', {
        ...prevPopups,
        [event.id_eveniment]: true,
      });
    
      return {
        ...prevPopups,
        [event.id_eveniment]: true,
      };
    });
  };    

  const handleZoomQR = () => {
    setZoomedQR(!zoomedQR);
  };

  const Popup = ({ textCode, qrCodeURL, onClose }) => {
    return (
      <div className='popup-content'>
        <div>
          <h4 className='QR'>Codul QR:</h4>
          <QRCode
            value={qrCodeURL}
            size={zoomedQR ? 356 : 128}
            onClick={handleZoomQR}
          />
          <p className='TEXT'>Codul TEXT: <br></br>{textCode}</p>
          <button onClick={onClose}>Închide</button>
        </div>
      </div>
    );
  };

  return (
    <div className='events'>
      <h1 className='h1lista'>Lista de evenimente</h1>
      {events && Array.isArray(events) && events.length > 0 ? (
        <ul className='evenimente'>
          {events.map((event) => (
            <li key={event.id_eveniment}>
              Nume eveniment: {event.nume_eveniment} <br></br>Locație:{event.locatie} <br></br>Data: {event.scheduled_start_time} <br></br> Durata: {event.duration} minute
              <br />
              Stare: {event.status}
              <br />
              <button onClick={() => handleGenerateCodes(event)}>Generare Coduri</button>
              {event.codes.length > 0 && popups[event.id_eveniment] && (
                <Popup
                  textCode={event.codes[event.codes.length - 1].textCode}
                  qrCodeURL={event.codes[event.codes.length - 1].qrCodeURL}
                  onClose={() =>
                    setPopups((prevPopups) => {
                      return {
                        ...prevPopups,
                        [event.id_eveniment]: false,
                      };
                    })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available.</p>
      )}
      {zoomedQR && (
        <div>
          <p>Apasă din nou pe QR pentru a reveni la dimensiunea normală.</p>
        </div>
      )}
    </div>
  );
};

export default Evenimente;
