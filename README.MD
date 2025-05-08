### GUIDA PASSO PER PASSO PER RIFARE L'APPLICAZIONE ###

## Passi preliminari ##

1. Aprire terminale dentro al progetto e digitare "npm i", così da installare tutte le dependencies.
2. Una volta fatto questo creiamo la cartella "src" e dentro ad essa il file "index.js".
3. Entriamo nel file "index.js"

### CONFIGURAZIONE SERVER ###

Creazione Server e gestione porta:

```js
const express = require("express");
const server = express();
const port = 3000;
server.use(express.json())
```

Creazione "listen" del server e update status

```js
server.listen(port, () => {
    console.log("Server in Ascolto!")
})
```

### GENERAZIONE PASSWORD PER APP DA GMAIL

Andare su questo **[[link](https://myaccount.google.com/security)]**

Digitare nella barra di ricerca **"App password"**

Cliccare su **Password per le App**

Entrare, decidere un nome per il **"servizio"** e poi copiare la password.

### UTILIZZO PASSWORD GENERATA

Creazione file **".env e .env.local"** dove andremo a salvare le variabili d'ambiente.

Formato file .env:

```json
SMT_PASS = "your password"  
SMTP_USER = youremail@gmail.com  
SMTP_SERVICE = gmail
```
*** La password è l'unico campo che deve essere messo tra virgolette ***

*-Sulla repository si trova il file .env.example da utilizzare come template*


***Ricorda: non pubblicare mai questi file su github, sono dati sensibili!***


### CREAZIONE TRANSPONDER

Nel nostro file src/index.js, andiamo a creare il **transponder**, cioè quello gestisce la connessione con il server di posta e l'invio delle email.

```js
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }
}); 
```

### VERIFICA FUNZIONAMENTO TRANSPONDER ###

Andiamo ad includere un controllo sul transponder per verificare l'effettiva riuscita della connessione.

```js
transporter.verify((error, success) => {
    if (error) {
        console.log('Errore nella connessione SMTP:', error);
    } else {
        console.log('Connessione SMTP riuscita!');
    }
});
```

### CREAZIONE ROTTA VISUALIZZAZIONE FORM

Creiamo una rotta "GET" per far visualizzare di base il nostro file "index.html".

```js
// Rotta Form
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
```

Esponiamo poi i file json per visualizzare Province e Comuni:

```js
// Configura la cartella json per servire file statici
server.use('/json', express.static(path.join(__dirname, '../json')));
```

### CREAZIONE ROTTA INVIO POST

Creiamo ora la rotta per l'invio dei dati del form

```js
server.post('/form-data', async (req, res) => {
    try {
        console.log('Dati form ricevuti:', req.body);        

        // Invia l'email
        await transporter.sendMail(mailOptions);
        
        // Risposta al client
        res.json({ 
            success: true, 
            message: 'Email inviata con successo!' 
        });
    } catch (error) {
        console.error('Errore nell\'invio della mail:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
```


### CONFIGURAZIONE DOTENV E NODEMAILER

```js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
```

### CREAZIONE MESSAGGIO INVIO MAIL

Andiamo ad aggiungere questo codice dopo "```
        try {
        console.log('Dati form ricevuti:', req.body);```"

```js
const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: 'youremail@example.com',
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
```

### CONFIGURAZIONE CORS

Per poter inviare richieste dai file HTML, dobbiamo installare e configurare CORS

```js
// Aggiungi CORS per permettere richieste dal tuo form HTML
const cors = require('cors');

// Configura CORS
server.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
```

### AGGIUNTA ALLEGATI

```js
// Aggiunta allegati 

            attachments: {
                filename: 'piedi.jpg',
                path: path.join(__dirname, '../assets', 'piedi.jpg' )
            }
        };
```