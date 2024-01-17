import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useUser } from '../context/UserContext';
import { useEventContext } from '../context/EventsContext';
import '../styles/Inscriere.css';

const InscriereEvenimente = () => {
  const { participantId } = useUser();
  const { setParticipatingEvents, participatingEvents, isCodeValidForEvent } = useEventContext();
  const [enteredCodes, setEnteredCodes] = useState({});
  const [verificationResults, setVerificationResults] = useState({});
  const [scannedCode, setScannedCode] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fetchParticipatingEvents = async () => {
      try {
        if (!participantId) {
          console.error('Id-ul participantului nu este disponibil.');
          return;
        }

        const response = await fetch(`http://localhost:8000/ListaEvenimente?idParticipant=${participantId}`);
        const data = await response.json();

        const participantEvents = data.events || [];

        setParticipatingEvents(participantEvents);
      } catch (error) {
        console.error('Eroare la obținerea evenimentelor participante:', error);
      }
    };

    if (participantId) {
      fetchParticipatingEvents();
    }
  }, [participantId, setParticipatingEvents]);

  const handleCodeChange = (eventId, event) => {
    setEnteredCodes((prevEnteredCodes) => ({
      ...prevEnteredCodes,
      [eventId]: event.target.value,
    }));
  };

  const handleVerifyCode2 = async (eventId) => {
    const enteredCode = enteredCodes[eventId] || '';
    console.log('Verifying code:', enteredCode);
  
    const isValid = isCodeValidForEvent(eventId, enteredCode);
  
    setVerificationResults((prevResults) => ({
      ...prevResults,
      [eventId]: isValid ? 'Codul este corect!' : 'Codul este incorect.',
    }));
  
    console.log('Verification result:', isValid);
  
    if (isValid) {
      console.log('Codul este corect! Actualizare starea de participare sau alte acțiuni...');
    
      const response = await fetch('http://localhost:8000/InscriereEvenimente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, eventId }),
      });
    
      const data = await response.json();
    
      console.log('Actualizare starea de prezență:', data.message);
    }
  };
  
  

  const handleVerifyCode = async (eventId, code) => {
    console.log('Verifying code:', code);
    const enteredCode = code.text ;
    const isValid = isCodeValidForEvent(eventId, enteredCode);
  
  
    setVerificationResults((prevResults) => ({
      ...prevResults,
      [eventId]: isValid ? 'Codul este corect!' : 'Codul este incorect.',
    }));
  
    console.log('Verification result:', isValid);

    if (isValid) {
      console.log('Codul este corect! Actualizare starea de participare sau alte acțiuni...');
    
      const response = await fetch('http://localhost:8000/InscriereEvenimente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, eventId }),
      });
    
      const data = await response.json();
    
      console.log('Actualizare starea de prezență:', data.message);
    }
  };
  
  const handleScan = (eventId, data) => {
    if (data) {
      const codeFromURL = data; 
      setScannedCode(codeFromURL);
      handleVerifyCode(eventId, codeFromURL);
      setScanning(false); 
    }
  };
  
  
  const handleError = (err) => {
    console.error('Error scanning QR code:', err);
    setScanning(false);
  };
  

  return (
    <div className='inscriere'>
      <h1 className='h11'>Evenimente la care participi</h1>
      <ul className='evenimente'>
        {participatingEvents.map((event) => (
          <li key={event.id_eveniment}>
            Nume eveniment: {event.nume_eveniment}, Data: {event.scheduled_start_time}, Durata: {event.duration} minute
            <br />
            <p >Introdu codul text sau apasă butonul de scanare pentru codul QR:</p>
            <input
              type="text"
              value={enteredCodes[event.id_eveniment] || ''}
              onChange={(e) => handleCodeChange(event.id_eveniment, e)}
            />
            <button className='btn' onClick={() => handleVerifyCode2(event.id_eveniment)}>Verifică Cod</button>
            <button className='btn 'onClick={() => setScanning(true)}>Scanează Cod</button>

            <div className="qr-reader-container">
              {scanning && (
                <QrReader
                  delay={300}
                  onResult={(result) => handleScan(event.id_eveniment, result)}
                  onError={(error) => handleError(error)}
                  canvasStyle={{ willReadFrequently: true }}
                  videoConstraints={{ facingMode: 'environment' }}
                />
              )}
            </div>

            {verificationResults[event.id_eveniment] && <p>{verificationResults[event.id_eveniment]}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InscriereEvenimente;
