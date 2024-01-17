import { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export const useEventContext = () => {
    const context = useContext(EventContext);
  
    const isCodeValidForEvent = (eventId, code) => {
      const event = context.events.find((e) => e.id_eveniment === eventId);
    
      if (!event) {
        return false; 
      }
    
      const isTextCodeValid = event.codes.some((c) => c.textCode === code);
    
      const isQrCodeValid = event.codes.some((c) => c.qrCodeURL === code);
    
      return isTextCodeValid || isQrCodeValid;
    };
    
  
    return {
      ...context,
      isCodeValidForEvent,
    };
  };
  
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [popups, setPopups] = useState({});
  const [participatingEvents, setParticipatingEvents] = useState([]);

  const contextValue = {
    events,
    setEvents,
    popups,
    setPopups,
    participatingEvents,
    setParticipatingEvents, 
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};
