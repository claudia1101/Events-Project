// components/Contact.js
import React from 'react';
import ContactForm from '../components/ContactForm'; 
import '../styles/Contact.css';

const Contact = () => {
  return (
    <div className='contact'>
      <h2>Contactează-ne</h2>
      <p>Pentru orice întrebări sau comentarii, ne poți contacta folosind formularul de mai jos sau trimițând un e-mail la adresa noastră de contact.</p>

      <ContactForm />

      <p>Pentru suport imediat, ne poți suna la numărul de telefon: +07.725.1234</p>

      <p>Adresa noastră de e-mail: eventsphere@contact.com</p>

    </div>
  );
};

export default Contact;
