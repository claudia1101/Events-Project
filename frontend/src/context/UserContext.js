// UserContext.js
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [participantId, setParticipantId] = useState(null);
  const [organizatorId, setOrganizatorId] = useState(null);

  console.log('participantId din context:', participantId);
  console.log('organizatorId din context:', organizatorId);

  return (
    <UserContext.Provider value={{ participantId, setParticipantId, organizatorId, setOrganizatorId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
