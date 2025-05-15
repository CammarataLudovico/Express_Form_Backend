const express = require("express");
const path = require('path'); // Aggiungi questa riga all'inizio del file
const server = express();
const port = 3000;

// Dichiarazione e Creazione Database
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, "../data/database.db")
const db = new sqlite3.Database(dbPath);

// Aggiungi CORS per permettere richieste dal tuo form HTML
const cors = require('cors');

// Configura CORS
server.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
server.use(express.json());
dotenv.config();

const { attachment } = require("express/lib/response");

// Configura la cartella json per servire file statici
server.use('/json', express.static(path.join(__dirname, '../json')));

// Rotta Form
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }
}); 

transporter.verify((error, success) => {
    if (error) {
        console.log('Errore nella connessione SMTP:', error);
    } else {
        console.log('Connessione SMTP riuscita!');
    }
});

// NUOVO ENDPOINT: Chiamata POST per il form di registrazione utente
server.post('/form-data', async (req, res) => {
    try {
        console.log('Dati form ricevuti:', req.body);

        /* Destrutturazione variabili, è uguale a scrivere:
            -const nome = req.body.nome
            -const cognome = req.body.cognome
        */
        const {
            nome,
            cognome,
            data_nascita,
            indirizzo,
            cf,
            cellulare,
            email,
            oggetto,
            messaggio,
            provincia,
            comune_nome
        } = req.body;

        /*
            Ora andremo ad eseguire un passaggio per evitare SQL Injection, andiamo a salvare i paramentri in un array,
            con i loro valori reali, ma una volta che andremo ad eseguire query, sqlite trasformerà queste variabili
            in "?", dei placeholder, così non rischiamo che un utente malintenzionato
            possa iniettare del codice SQL malevolo nei dati del form.
        */

        const params = [
            nome,
            cognome,
            data_nascita,
            indirizzo,
            cf,
            cellulare,
            email,
            oggetto,
            messaggio,
            provincia,
            comune_nome
        ];

        // Andiamo a salvare i dati nel db

        const saveDataSQL = `
                INSERT INTO contatti (
                    nome, cognome, data_nascita, indirizzo, codice_fiscale, cellulare, email, oggetto_mail, messaggio_mail, provincia, comune
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  
            `;
        
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: 'x',
            subject: `${req.body.oggetto}`,
            html: `
                <h2>📝 Contatto Utente 📝</h2>
                
                <p><strong>👤 Nome:</strong> ${req.body.nome}</p>
                <p><strong>👤 Cognome:</strong> ${req.body.cognome}</p>
                <p><strong>📱 Cellulare:</strong> ${req.body.cellulare}</p>
                <p><strong>👤 Età: </strong> ${req.body.data_nascita} </p>
                <p><strong>🏠 Indirizzo:</strong> ${req.body.indirizzo}</p>
                <p><strong>🆔 Codice Fiscale:</strong> ${req.body.cf}</p>
                <p><strong>📧 Email:</strong> ${req.body.email}</p>
                <p><strong>📧 Oggetto:</strong> ${req.body.oggetto}</p>
                <p><strong>📧 Messaggio:</strong> ${req.body.messaggio}</p>
                <p><strong>🏙️ Provincia:</strong> ${req.body.provincia}</p>
                <p><strong>🏙️ Comune:</strong> ${req.body.comune_nome}</p>
            `,

            // Aggiunta allegati 
             /*
            attachments: {
                filename: 'test.jpg',
                path: path.join(__dirname, '../assets', 'test.jpg' )
            }*/
        };

        // Gestione errori salvataggio dei dati nel database
        db.run(saveDataSQL, params, function (err) {
            if (err) {
                console.error("Errore DB:", err);
                return res.status(500).send("Errore nel salvataggio dei dati nel database");
            }
        });
        

        // Invia l'email
        await transporter.sendMail(mailOptions);
        
        // Risposta al client
        res.json({ 
            success: true, 
            message: 'Dati salvati con successo nel database e mail inviata!' 
        });
    } catch (error) {
        console.error('Errore nell\'invio dei dati:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contatti (
        contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        data_nascita TEXT NOT NULL,
        indirizzo TEXT NOT NULL,
        codice_fiscale TEXT NOT NULL,
        cellulare INTEGER NOT NULL,
        email TEXT NOT NULL,
        oggetto_mail TEXT NOT NULL,
        messaggio_mail TEXT NOT NULL,
        provincia TEXT NOT NULL,
        comune TEXT NOT NULL
    )`);
    console.log("Tutto ok")
});


/*transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error sending email: ', error);
    }
    console.log('Email sent: ', info.response);
});*/

server.listen(port, () => {
    console.log("Server in Ascolto!")
})