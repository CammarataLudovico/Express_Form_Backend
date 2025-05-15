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

Per poter inviare richieste dai file HTML, dobbiamo installare e configurare CORS.
Andiamo ad inserirlo all'inizio del nostro codice, fuori dal transponder.

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

### CREAZIONE E ACCESSO FILE DB

Creiamo la cartella ***"data"*** e dentro di essa il file ***"database.db"***

```js
// Dichiarazione e Creazione Database
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, "../data/database.db")
const db = new sqlite3.Database(dbPath);
```

Usiamo ***dbPath*** così da non avere problemi coi percorsi assoluti.

### CREAZIONE TABELLE DATABASE ###

Ci appoggiaremo ad un file ***database.db*** creato in precendenza, in esso andremo a creare le varie tabelle con il codice qui sotto:

```js
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
    // console.log per essere sicuri
    console.log("Tutto ok")
});
```

Con questo codice il nostro file sarà popolato dalle varie tabelle definite, con tutti gli attributi richiesti.

***Attenzione: se nel file non vengono create correttamente le tabelle, stoppare il server, finire di scrivere tutto questo codice, cancellare il file database.db corrente e far ripartire il server, così la creazione non avrà problemi di alcuna sorta.***

### DESTRUTTURAZIONE VARIABILI PER PASSAGGIO AL DATABASE ###

Ora andremo ad eseguire una **destrutturazione** delle variabili che ci servano da passare al nostro database, in una maniera molto semplice e veloce, che ci farà risparmiare molto tempo.

```js
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
```

### EVITIAMO LE SQL INJECTION! ###

Ora andremo ad eseguire un passaggio per evitare **SQL Injection**, andiamo a salvare i paramentri in un **array**, con i loro valori reali, ma una volta che andremo ad eseguire query, sqlite trasformerà queste variabili in "?", dei **placeholder**, così non rischiamo che un utente malintenzionato, possa iniettare del codice SQL malevolo nei dati del form.

```js
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
```

### SALVATAGGIO DATI DENTRO IL DATABASE ###

Ora andiamo a creare la funzione di salvataggio vero e proprio dei nostri dati all'interno del nostro database.

```js
const saveDataSQL = `
            INSERT INTO contatti (
                INSERT INTO contatti (
                    nome, cognome, data_nascita, indirizzo, codice_fiscale, cellulare, email, oggetto_mail, messaggio_mail, provincia, comune
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
```

### GESTIONE ERRORI NEL SALVATAGGIO DEI DATI

Ora andiamo a creare la funzione con cui gestiremo gli errori di salvataggio dei dati  nel nostro database, così da fare debugging e capire cosa stiamo sbagliando.

```js
db.run(saveDataSQL, params, function (err) {
            if (err) {
                console.error("Errore DB:", err);
                return res.status(500).send("Errore nel salvataggio dei dati nel database");
            }
        });
```

### INVIO RISPOSTA CLIENT 

Ora andiamo a definire la risposta che daremo al client, per assicurarci che l'invio venga recepito anche dalla sua parte.

```js
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
```

### CREAZIONE FILE DI TEST, CON RICHIESTA HTTP

Ora andiamo a crearci un file chiamato **"test.http"**, dentro alla cartella **"test"** che andiamo a crearci, così da testare la richiesta post senza dover sempre scrivere dentro la nostra form, ma facciamo tutto direttamente da Visual Studio Code.

```http
POST http://localhost:3000/form-data
Content-Type: application/json

{
    "nome" : "Ludovico",
    "cognome" : "Cammarata",
    "data_nascita" : "2004-03-12",
    "indirizzo" : "Via salamella",
    "cf" : "MLVPVM37L48B769G",
    "cellulare": "3200597845",
    "email" : "ludovico.cammarata.24@stud.itsaltoadriatico.it",
    "oggetto" : "Info sul prodotto",
    "messaggio" : "Prova messaggio",
    "provincia" : "VE",
    "comune_nome" : "Gruaro"
}
```

***Ricordiamoci sempre di aggiungere "Content-Type: application/json", altrimenti il nostro codice non saprà come gestire il formato dei nostri dati e andrà in crash.***