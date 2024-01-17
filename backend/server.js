const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mariadb = require('mariadb');
const app = express();
const XLSX = require('xlsx');
app.use(cors());
app.use(bodyParser.json());
const fs = require('fs');
const fastCsv = require('fast-csv');
const port = 8000;

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'parola',
    database: 'database-events',
    connectionLimit: 20,
    acquireTimeout: 10000, // timpul maxim de așteptare pentru o conexiune în milisecunde
    waitForConnections: true, // dacă să aștepte în loc să returneze o eroare atunci când limita de conexiuni este atinsă
    queueLimit: 0, // numărul maxim de cereri de conexiuni care pot fi în așteptare (0 pentru nelimitat)
  });
  
  async function createTable() {
    let conn;
    try {
      conn = await pool.getConnection();
  
      await conn.query(`
      CREATE TABLE IF NOT EXISTS Organizatori(
        id_organizator INT AUTO_INCREMENT PRIMARY KEY,
        nume VARCHAR(255) NOT NULL,
        prenume VARCHAR(255) NOT NULL
      )
    `);
 
      await conn.query(`
      CREATE TABLE IF NOT EXISTS GrupEvenimente (
          id_grup INT AUTO_INCREMENT PRIMARY KEY,
          id_organizator INT NOT NULL,
          nume_grup VARCHAR(255) NOT NULL,
          repetitie_tip ENUM('zilnic', 'saptamanal', 'lunar') DEFAULT NULL,
          repetitie_interval INT DEFAULT NULL,
          FOREIGN KEY (id_organizator) REFERENCES Organizatori(id_organizator)
      )
  `);
  
      await conn.query(`
        CREATE TABLE IF NOT EXISTS Eveniment (
          id_eveniment INT AUTO_INCREMENT PRIMARY KEY,
          id_grup INT NOT NULL,
          nume_eveniment VARCHAR(255) NOT NULL,
          locatie VARCHAR(50),
          scheduled_start_time DATETIME NOT NULL,
          duration INT NOT NULL,
          FOREIGN KEY (id_grup) REFERENCES GrupEvenimente(id_grup)
        )
      `);
  
  
      await conn.query(`
        CREATE TABLE IF NOT EXISTS Participanti (
          id_participant INT AUTO_INCREMENT PRIMARY KEY,
          nume VARCHAR(255) NOT NULL,
          prenume VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          parola VARCHAR(255) NOT NULL
          
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS Participari (
          id_participare INT AUTO_INCREMENT PRIMARY KEY,
          id_eveniment INT NOT NULL,
          id_organizator INT NOT NULL,
          id_participant INT NOT NULL,
          nume_eveniment VARCHAR(255) NOT NULL,
          nume_participant VARCHAR(255) NOT NULL,
          FOREIGN KEY (id_eveniment) REFERENCES Eveniment(id_eveniment),
          FOREIGN KEY (id_organizator) REFERENCES Organizatori(id_organizator),
          FOREIGN KEY (id_participant) REFERENCES Participanti(id_participant)
        )
      `);
  
    } catch (error) {
      console.error('Eroare la crearea tabelului:', error);
    } finally {
      if (conn) conn.release();
    }
  }
  createTable();

app.get('/', (req, res) => {
  res.send('Bun venit pe backend!');
});

app.post('/register/:userType', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const { userType } = req.params;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
    }
    
    const conn = await pool.getConnection();
    
    if (userType === 'Participant') {
      await conn.query(
        'INSERT INTO Participanti (nume, prenume, email, parola) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, password]
      );
    } else if (userType === 'Organizator') {
      await conn.query(
        'INSERT INTO Organizatori (nume, prenume, email, parola) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, password]
      );
    } else {
      conn.release();
      return res.status(400).json({ error: 'Tip de utilizator nevalid.' });
    }
    
    conn.release();
    
    return res.status(201).json({ message: 'Utilizator înregistrat cu succes!' });
    
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    return res.status(500).json({ error: 'A apărut o eroare la înregistrare.' });
  }
});

app.post('/login/:userType', async (req, res) => {
  try {
    const { email, password, idOrganizator } = req.body;
    const { userType } = req.params;

    if (!email || !password) {
      return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
    }

    const conn = await pool.getConnection();
    let user;
    let organizator;
    let participant;

    if (userType === 'Participant') {
      [user] = await conn.query('SELECT * FROM Participanti WHERE email = ? AND parola = ?', [email, password]);
      [participant] = await conn.query('SELECT id_participant FROM Participanti WHERE email = ? AND parola = ?', [email, password]);
    } else if (userType === 'Organizator') {
      [user] = await conn.query('SELECT * FROM Organizatori WHERE email = ? AND parola = ?', [email, password]);
      [organizator] = await conn.query('SELECT id_organizator FROM Organizatori WHERE email = ? AND parola = ?', [email, password]);
    } else {
      conn.release();
      return res.status(400).json({ error: 'Tip de utilizator nevalid.' });
    }

    conn.release();

    if (user) {
      return res.status(200).json({
        message: 'Autentificare reușită!',
        organizatorId: organizator ? organizator.id_organizator : null,
        participantId: participant ? participant.id_participant : null,
      });
    } else {
      return res.status(401).json({ error: 'Autentificare eșuată. Verificați email-ul și parola.' });
    }

  } catch (error) {
    console.error('Eroare la autentificare:', error);
    return res.status(500).json({ error: 'A apărut o eroare la autentificare.' });
  }
});

app.post('/AddEvents', async (req, res) => {
  try {
    const { organizatorId, groupName, numEvents, repetition, events } = req.body;

    const repetitie_tip = repetition ? repetition.type : null;
    const repetitie_interval = repetition ? repetition.interval : null;

    if (!organizatorId || !groupName || !numEvents || !events || events.length !== numEvents) {
      return res.status(400).json({ error: 'Toate câmpurile necesare trebuie furnizate corect.' });
    }

    const conn = await pool.getConnection();

    await conn.beginTransaction();

    const result = await conn.query(
      'INSERT INTO GrupEvenimente (id_organizator, nume_grup, repetitie_tip, repetitie_interval) VALUES (?, ?, ?, ?)',
      [organizatorId, groupName, repetitie_tip, repetitie_interval]
    );

    const groupId = result.insertId;

    for (const event of events) {
      await conn.query(
        'INSERT INTO Eveniment (id_grup, nume_eveniment,locatie, scheduled_start_time,duration) VALUES (?, ?,?, ?,?)',
        [groupId, event.name,event.location, event.startDate,event.duration]
      );
    }

    await conn.commit();

    conn.release();

    return res.status(201).json({ message: 'Evenimente adăugate cu succes în baza de date!' });

  } catch (error) {
    console.error('Eroare la adăugarea evenimentelor în baza de date:', error);
    return res.status(500).json({ error: 'A apărut o eroare la adăugarea evenimentelor în baza de date' });
  }
});

app.get('/Evenimente', async (req, res) => {
  try {
    const { organizatorId } = req.query;
    const conn = await pool.getConnection();

    const result = await conn.query(
      'SELECT e.id_eveniment, e.nume_eveniment, e.locatie, e.scheduled_start_time, e.duration, g.repetitie_tip, g.repetitie_interval ' +
      'FROM Eveniment e ' +
      'JOIN GrupEvenimente g ON e.id_grup = g.id_grup ' +
      'WHERE g.id_organizator = ?',
      [organizatorId]
    );

    const currentDateTime = new Date();
    const eventsWithStatus = await Promise.all(result.map(async (event) => {
      const startDateTime = new Date(event.scheduled_start_time);
      const endDateTime = new Date(startDateTime.getTime() + event.duration * 60000);

      if (currentDateTime < startDateTime) {
        event.status = 'Closed';
      } else {
        event.status = 'Open';
      }

      event.repetitie_tip = event.repetitie_tip || null;
      event.repetitie_interval = event.repetitie_interval || null;

      return event;
    }));

    conn.release();

    res.status(200).json({ events: eventsWithStatus });
  } catch (error) {
    console.error('Eroare la preluarea evenimentelor:', error);
    res.status(500).json({ error: 'A apărut o eroare la preluarea evenimentelor.' });
  }
});

app.get('/ListaEvenimente', async (req, res) => {
  try {
    const { idParticipant } = req.query;
    const conn = await pool.getConnection();

    if (idParticipant) {
      const result = await conn.query(`
        SELECT e.id_eveniment, e.nume_eveniment, e.duration, e.locatie, e.scheduled_start_time, g.nume_grup
        FROM Eveniment e
        JOIN Participari p ON e.id_eveniment = p.id_eveniment
        JOIN GrupEvenimente g ON e.id_grup = g.id_grup
        WHERE p.id_participant = ?
      `, [idParticipant]);

      res.status(200).json({ events: result });
    } else {
      const result = await conn.query(`
        SELECT e.id_eveniment, e.nume_eveniment, e.scheduled_start_time, e.duration, e.locatie, g.nume_grup
        FROM Eveniment e
        JOIN GrupEvenimente g ON e.id_grup = g.id_grup
      `);

      res.status(200).json({ events: result });
    }

    conn.release();
  } catch (error) {
    console.error('Eroare la preluarea listei de evenimente:', error);
    res.status(500).json({ error: 'A apărut o eroare la preluarea listei de evenimente.' });
  }
});

app.post('/ListaEvenimente', async (req, res) => {
  try {
    const { idParticipant, idEveniment } = req.body;

    if (!idParticipant || !idEveniment) {
      return res.status(400).json({ error: 'Toate câmpurile necesare trebuie furnizate corect.' });
    }

    const conn = await pool.getConnection();

    const [eventInfo] = await conn.query(
      'SELECT id_organizator, id_grup FROM GrupEvenimente WHERE id_grup = (SELECT id_grup FROM Eveniment WHERE id_eveniment = ?)',
      [idEveniment]
    );
    

    if (!eventInfo || !eventInfo.id_organizator || !eventInfo.id_grup) {
      conn.release();
      return res.status(404).json({ error: 'Informații despre evenimentul nu au fost găsite.' });
    }

    const { id_organizator, id_grup } = eventInfo;

    const [evenimentInfo] = await conn.query(
      'SELECT nume_eveniment, scheduled_start_time FROM Eveniment WHERE id_eveniment = ?',
      [idEveniment]
    );

    if (!evenimentInfo || !evenimentInfo.nume_eveniment || !evenimentInfo.scheduled_start_time) {
      conn.release();
      return res.status(404).json({ error: 'Informații despre evenimentul nu au fost găsite.' });
    }

    const { nume_eveniment, scheduled_start_time } = evenimentInfo;

    const [participantInfo] = await conn.query(
      'SELECT CONCAT(nume, " ", prenume) AS nume_participant FROM Participanti WHERE id_participant = ?',
      [idParticipant]
    );

    if (!participantInfo || !participantInfo.nume_participant) {
      conn.release();
      return res.status(404).json({ error: 'Informații despre participant nu au fost găsite.' });
    }

    const numeParticipant = participantInfo.nume_participant;

    const x = await conn.query(`SELECT COUNT(*) FROM Participari WHERE id_eveniment=? AND id_participant=?`, [idEveniment, idParticipant]);
    console.log(x);
    if (x[0]['COUNT(*)'] === 0n) {
      const result = await conn.query(
        'INSERT INTO Participari (id_eveniment, id_organizator, id_grup, id_participant, nume_eveniment, scheduled_start_time, nume_participant) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [idEveniment, id_organizator, id_grup, idParticipant, nume_eveniment, scheduled_start_time, numeParticipant]
      );

      console.log('Query result:', result);

      conn.release();

      return res.status(201).json({ message: 'Participare salvată cu succes în baza de date!' });
    } else {
      return res.status(400).json({ error: 'Participarea există deja.' });
    }

  } catch (error) {
    console.error('Eroare la salvarea participării în baza de date:', error);
    return res.status(500).json({ error: 'A apărut o eroare la salvarea participării în baza de date' });
  }
});

app.post('/InscriereEvenimente', async (req, res) => {
  try {
    const { participantId, eventId } = req.body;

    if (!participantId || !eventId) {
      return res.status(400).json({ error: 'Toate câmpurile necesare trebuie furnizate corect.' });
    }

    const conn = await pool.getConnection();

    const result = await conn.query(
      'UPDATE Participari SET prezenta = 1 WHERE id_participant = ? AND id_eveniment = ?',
      [participantId, eventId]
    );

    console.log('Query result:', result);

    conn.release();

    return res.status(200).json({ message: 'Starea de prezență actualizată cu succes în baza de date!' });

  } catch (error) {
    console.error('Eroare la actualizarea stării de prezență în baza de date:', error);
    return res.status(500).json({ error: 'A apărut o eroare la actualizarea stării de prezență în baza de date' });
  }
});

app.get('/ListaParticipanti', async (req, res) => {
  try {
    const { idOrganizator, idEveniment } = req.query;
    const conn = await pool.getConnection();

    const result = await conn.query(`
      SELECT p.nume, p.prenume, p.email, pt.prezenta
      FROM Participanti p
      JOIN Participari pt ON p.id_participant = pt.id_participant
      WHERE pt.id_organizator = ? AND pt.id_eveniment = ? AND pt.prezenta = 1;
    `, [idOrganizator, idEveniment]);

    conn.release();

    res.status(200).json({ participants: result });
  } catch (error) {
    console.error('Eroare la preluarea participanților prezenți:', error);
    res.status(500).json({ error: 'A apărut o eroare la preluarea participanților prezenți.' });
  }
});

app.get('/Participari', async (req, res) => {
  try {
    const { idParticipant } = req.query;
    const conn = await pool.getConnection();

    if (idParticipant) {
      const result = await conn.query(`
        SELECT e.id_eveniment, e.nume_eveniment, e.scheduled_start_time, e.duration
        FROM Eveniment e
        JOIN Participari p ON e.id_eveniment = p.id_eveniment
        WHERE p.id_participant = ? AND p.prezenta=1
      `, [idParticipant]);

      res.status(200).json({ events: result });
    } else {
      const result = await conn.query(`
        SELECT id_eveniment, nume_eveniment, scheduled_start_time, duration
        FROM Eveniment
      `);

      res.status(200).json({ events: result });
    }

    conn.release();
  } catch (error) {
    console.error('Eroare la preluarea listei de evenimente:', error);
    res.status(500).json({ error: 'A apărut o eroare la preluarea listei de evenimente.' });
  }
});

app.get('/all-groups-and-events', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const groupsResult = await conn.query('SELECT id_grup, nume_grup FROM GrupEvenimente');
    const eventsResult = await conn.query('SELECT id_eveniment, nume_eveniment FROM Eveniment');
    conn.release();

    const groups = groupsResult.map(group => ({ id: group.id_grup, name: group.nume_grup }));
    const events = eventsResult.map(event => ({ id: event.id_eveniment, name: event.nume_eveniment }));

    res.status(200).json({ groups, events });
  } catch (error) {
    console.error('Error fetching groups and events:', error);
    res.status(500).json({ error: 'An error occurred while fetching groups and events.' });
  }
});

app.get('/exportParticipantsFromGroup/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const conn = await pool.getConnection();

    const result = await conn.query(`
    SELECT p.nume, p.prenume, p.email
    FROM Participanti p
    JOIN Participari pt ON p.id_participant = pt.id_participant
    WHERE pt.id_grup = ? AND pt.prezenta = 1;
    
    `, [groupId]);

    conn.release();

    const csvData = result.map(participant => [participant.nume, participant.prenume, participant.email]);
    const csvFilePath = 'participants_group.csv';

    fastCsv.writeToPath(csvFilePath, csvData, { headers: ['Nume', 'Prenume', 'Email'] })
      .on('error', (error) => {
        console.error('Eroare la exportul CSV pentru participanții din grup:', error);
        res.status(500).json({ error: 'A apărut o eroare la exportul CSV pentru participanții din grup.' });
      })
      .on('finish', () => {
        res.status(200).json({ message: 'Export CSV reușit pentru participanții din grup.', participants: result,  });
      });

  } catch (error) {
    console.error('Eroare la exportul CSV pentru participanții din grup:', error);
    res.status(500).json({ error: 'A apărut o eroare la exportul CSV pentru participanții din grup.' });
  }
});

app.get('/exportParticipantsFromEvent/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const conn = await pool.getConnection();

    const result = await conn.query(`
    SELECT p.nume, p.prenume, p.email
    FROM Participanti p
    JOIN Participari pt ON p.id_participant = pt.id_participant
    WHERE pt.id_eveniment = ? AND pt.prezenta = 1;
    
    `, [eventId]);

    conn.release();

    const csvData = result.map(participant => [participant.nume, participant.prenume, participant.email]);
    const csvFilePath = 'participants_event.csv';

    fastCsv.writeToPath(csvFilePath, csvData, { headers: ['Nume', 'Prenume', 'Email'] })
      .on('error', (error) => {
        console.error('Eroare la exportul CSV pentru participanții din eveniment:', error);
        res.status(500).json({ error: 'A apărut o eroare la exportul CSV pentru participanții din eveniment.' });
      })
      .on('finish', () => {
        res.status(200).json({ message: 'Export CSV reușit pentru participanții din eveniment.' , participants: result, });
      });

  } catch (error) {
    console.error('Eroare la exportul CSV pentru participanții din eveniment:', error);
    res.status(500).json({ error: 'A apărut o eroare la exportul CSV pentru participanții din eveniment.' });
  }
});

app.get('/exportParticipantsFromGroupXLSX/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const conn = await pool.getConnection();

    const result = await conn.query(`
    SELECT p.nume, p.prenume, p.email
    FROM Participanti p
    JOIN Participari pt ON p.id_participant = pt.id_participant
    WHERE pt.id_grup = ? AND pt.prezenta = 1;
    
    `, [groupId]);

    conn.release();

    const participants = result.map(participant => ({
      nume: participant.nume,
      prenume: participant.prenume,
      email: participant.email,
    }));

    res.status(200).json({ participants:result});

  } catch (error) {
    console.error('Eroare la exportul JSON pentru participanții din grup:', error);
    res.status(500).json({ error: 'A apărut o eroare la exportul JSON pentru participanții din grup.' });
  }
});

app.get('/exportParticipantsFromEventXLSX/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const conn = await pool.getConnection();

    const result = await conn.query(`
    SELECT p.nume, p.prenume, p.email
FROM Participanti p
JOIN Participari pt ON p.id_participant = pt.id_participant
WHERE pt.id_eveniment = ? AND pt.prezenta = 1;

    `, [eventId]);

    conn.release();

    const ws = XLSX.utils.json_to_sheet(result);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'participants_event');
    XLSX.writeFile(wb, 'participants_event.xlsx');

    res.status(200).json({ message: 'Export XLSX reușit pentru participanții din eveniment.' ,  participants: result, });
  } catch (error) {
    console.error('Eroare la exportul XLSX pentru participanții din eveniment:', error);
    res.status(500).json({ error: 'A apărut o eroare la exportul XLSX pentru participanții din eveniment.' });
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});

