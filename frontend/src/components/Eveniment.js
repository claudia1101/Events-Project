// Eveniment.js
import React from 'react';
import QRCode from 'qrcode.react';

const Eveniment = ({ detalii, afiseazaQR }) => {
  return (
    <div>
      <h3>{detalii.nume}</h3>
      <p>Stare: {detalii.stare}</p>
      <p>Cod de acces: {detalii.codAcces}</p>
      {afiseazaQR ? (
        <QRCode value={detalii.codAcces} />
      ) : (
        <p>Cod de acces text: {detalii.codAcces}</p>
      )}
    </div>
  );
};

export default Eveniment;
