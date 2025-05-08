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