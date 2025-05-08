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