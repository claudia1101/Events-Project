// AddEvents.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Organizator.css';
import Typography from '@mui/material/Typography';

const AddEvents = ({ location }) => {
  const { organizatorId } = useUser();
  const [success, setSuccess] = useState('');

  const [groupDetails, setGroupDetails] = useState({
    groupName: '',
    numEvents: 0,
    repetition: {
      type: '', 
      interval: 0, 
    },
    events: [],
  });

  const handleGroupChange = (e) => {
    setGroupDetails((prevGroupDetails) => ({
      ...prevGroupDetails,
      groupName: e.target.value,
    }));
  };

  const handleNumEventsChange = (e) => {
    const numEvents = parseInt(e.target.value, 10);
    setGroupDetails((prevGroupDetails) => ({
      ...prevGroupDetails,
      numEvents,
      events: Array.from({ length: numEvents }, () => ({
        name: '',
        startDate: '',
        duration: 0,
        isOpen: false,
        isPast: false,
      })),
    }));
  };

  const calculateEventStatus = (startDate, duration) => {
    const now = new Date();
    const eventStartDate = new Date(startDate);
    const eventEndDate = new Date(eventStartDate.getTime() + duration * 60 * 1000);

    return {
      isOpen: eventStartDate <= now && now <= eventEndDate,
      isPast: eventEndDate < now,
    };
  };

  
  const handleEventChange = (index, property, value) => {
    setGroupDetails((prevGroupDetails) => {
      const updatedEvents = [...prevGroupDetails.events];
      updatedEvents[index] = {
        ...updatedEvents[index],
        [property]: value, 
        ...calculateEventStatus(value, property === 'duration' ? value : updatedEvents[index].duration),
      };

      return {
        ...prevGroupDetails,
        events: updatedEvents,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      if (groupDetails.numEvents <= 0) {
        console.error('Numărul de evenimente trebuie să fie mai mare decât zero.');
        return;
      }

      const eventData = {
        organizatorId: organizatorId,
        groupName: groupDetails.groupName,
        numEvents: groupDetails.numEvents,
        repetition: groupDetails.repetition,
        events: groupDetails.events,
      };

      if (eventData.events.length !== groupDetails.numEvents) {
        console.error('Toate detaliile evenimentelor trebuie completate.');
        return;
      }

      const response = await fetch(`http://localhost:8000/AddEvents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setSuccess('Grup de evenimente înregistrat cu succes!');
      } else {
        console.error('Eroare la crearea evenimentelor:', response.status);
      }
    } catch (error) {
      console.error('Eroare la crearea evenimentelor:', error);
    }
  };

  return (
    <div>
      <h1 className='h1'>Adaugă un grup de evenimente</h1>
      <label>
        Numele grupului:
        <input type="text" value={groupDetails.groupName} onChange={handleGroupChange} />
      </label>
      <br />
      <label>
        Numărul de evenimente:
        <input type="number" value={groupDetails.numEvents} onChange={handleNumEventsChange} />
      </label>
      <br />
      <label>
        Tipul repetarii:
        <select
          value={groupDetails.repetition.type}
          onChange={(e) => setGroupDetails((prevGroupDetails) => ({ ...prevGroupDetails, repetition: { ...prevGroupDetails.repetition, type: e.target.value } }))}
        >
          <option value="">No Repetition</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      <br />
      <label>
        Interval de repetare:
        <input
          type="number"
          value={groupDetails.repetition.interval}
          onChange={(e) => setGroupDetails((prevGroupDetails) => ({ ...prevGroupDetails, repetition: { ...prevGroupDetails.repetition, interval: parseInt(e.target.value, 10) } }))}
        />
      </label>
      <br />
      {groupDetails.events.map((event, index) => (
        <div key={index}>
          <h3>Evenimentul nr. {index + 1}</h3>
          <label>
            Numele:
            <input
              type="text"
              onChange={(e) => handleEventChange(index, 'name', e.target.value)}
            />
          </label>
          <br />
          <label>
            Locația:
            <input
              type="text"
              onChange={(e) => handleEventChange(index, 'location', e.target.value)}
            />
          </label>
          <br />
          <label>
            Data:
            <input
              type="datetime-local"
              onChange={(e) => handleEventChange(index, 'startDate', e.target.value)}
            />
          </label>
          <br />
          <label>
            Durata(minute):
            <input
              type="number"
              onChange={(e) => handleEventChange(index, 'duration', parseInt(e.target.value, 10))}
            />
          </label>
          <br />
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
      {success && (
            <Typography variant="body1" color="success" mt={4} align="center">
              {success}
            </Typography>
          )}
      <hr />
    </div>
  );
};

export default AddEvents;