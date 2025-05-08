const express = require("express");

const server = express();
const port = 3000;

/*// Dichiarazione e Creazione Database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.db');*/

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

const path = require('path'); // Aggiungi questa riga all'inizio del file

// Configura la cartella json per servire file statici
server.use('/json', express.static(path.join(__dirname, '../json')));

// Rotta Form
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

// NUOVO ENDPOINT: Chiamata POST per il form di registrazione utente
server.post('/form-data', async (req, res) => {
    try {
        console.log('Dati form ricevuti:', req.body);
        
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: 'ludovico.cammarata.24@stud.itsaltoadriatico.it',
            subject: `${req.body.oggetto}`,
            html: `
                <h2>📝 Contatto Utente 📝</h2>
                
                <p><strong>👤 Nome:</strong> ${req.body.nome}</p>
                <p><strong>👤 Cognome:</strong> ${req.body.cognome}</p>
                <p><strong>📱 Cellulare:</strong> ${req.body.cellulare}</p>
                <p><strong>🏠 Indirizzo:</strong> ${req.body.indirizzo}</p>
                <p><strong>🆔 Codice Fiscale:</strong> ${req.body.cf}</p>
                <p><strong>📧 Email:</strong> ${req.body.email}</p>
                <p><strong>📧 Oggetto:</strong> ${req.body.oggetto}</p>
                <p><strong>📧 Messaggio:</strong> ${req.body.messaggio}</p>
                <p><strong>🏙️ Provincia:</strong> ${req.body.provincia}</p>
                <p><strong>🏙️ Comune:</strong> ${req.body.comune_nome}</p>
            `
        };
        

        // Invia l'email
        await transporter.sendMail(mailOptions);
        
        // Risposta al client
        res.json({ 
            success: true, 
            message: 'Dati inviati con successo al bot Telegram' 
        });
    } catch (error) {
        console.error('Errore nell\'invio dei dati:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
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


/*transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error sending email: ', error);
    }
    console.log('Email sent: ', info.response);
});*/

server.listen(port, () => {
    console.log("Server in Ascolto!")
})