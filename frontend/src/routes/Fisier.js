import React, { useState, useEffect } from 'react';
import { Button, Spinner, Form } from 'react-bootstrap';

const Fisier = ({ exportType }) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedType, setSelectedType] = useState('group');
  const [selectedExportType, setSelectedExportType] = useState('csv');

  const fetchData = async () => {
    let groupsResponse;
    setLoading(true);
    try {
      groupsResponse = await fetch(`http://localhost:8000/all-groups-and-events?type=${selectedType}`);
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.groups);
      setEvents(groupsData.events);
    } catch (error) {
      console.error('Error fetching groups and events:', error);

      if (groupsResponse) {
        const clonedResponse = groupsResponse.clone();
const responseText = await clonedResponse.text();
console.log('Response content:', responseText);

      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const exportParticipants = async () => {
    if (!selectedId) {
      alert('Please select a group or an event.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/exportParticipants${selectedType === 'group' ? 'FromGroup' : 'FromEvent'}${selectedExportType === 'csv' ? '' : 'XLSX'}/${selectedId}`);
  
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        alert('An error occurred. Please check the console for details.');
        return;
      }
  
      const data = await response.json();
  
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_${selectedType === 'group' ? 'group' : 'event'}.${selectedExportType}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('An error occurred during export:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <Form.Group>
        <Form.Label>Selectează tipul:</Form.Label>
        <Form.Control as="select" onChange={(e) => setSelectedType(e.target.value)}>
          <option value="group">Groups</option>
          <option value="event">Events</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Selectează {selectedType === 'group' ? 'group' : 'event'}</Form.Label>
        <Form.Control as="select" onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Choose...</option>
          {selectedType === 'group' && groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
          {selectedType === 'event' && events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Selectează tipul exportului:</Form.Label>
        <Form.Control as="select" onChange={(e) => setSelectedExportType(e.target.value)}>
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </Form.Control>
      </Form.Group>
      <Button onClick={exportParticipants} disabled={loading}>
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            Exporting...
          </>
        ) : (
          `Export ${selectedExportType ? selectedExportType.toUpperCase() : ''}`
        )}
      </Button>
    </div>
  );
};

export default Fisier;
