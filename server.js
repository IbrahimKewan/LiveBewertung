const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Erlaubt alle Domains (für Tests)
        methods: ['GET', 'POST']
    }
});

let users = []; // Liste der Benutzer

// Middleware
app.use(cors());
app.use(express.static('public'));

// Socket.IO-Verbindungen
io.on('connection', (socket) => {
    console.log('Ein Benutzer hat sich verbunden.');

    // Sende aktuelle Benutzerliste und Durchschnitt an den neuen Client
    socket.emit('updateUsers', users);
    socket.emit('updateAverage', calculateAverage());

    // Empfange neuen Benutzer
    socket.on('newUser', (newUser) => {
        users.push(newUser);
        io.emit('updateUsers', users); // Aktualisierte Benutzerliste senden
    });

    // Empfange aktualisierte Bewertung
    socket.on('updateScore', ({ name, score }) => {
        const user = users.find(u => u.name === name);
        if (user) {
            user.score = score;
            io.emit('updateUsers', users); // Aktualisierte Benutzerliste senden
            io.emit('updateAverage', calculateAverage()); // Durchschnitt senden
        }
    });

    socket.on('disconnect', () => {
        console.log('Ein Benutzer hat die Verbindung getrennt.');
    });
});

// Durchschnitt berechnen
function calculateAverage() {
    if (users.length === 0) return 0;

    // Filtere Werte von 0 aus
    const validScores = users.map(user => user.score).filter(score => score > 0);

    if (validScores.length === 0) return 0;

    const sum = validScores.reduce((total, score) => total + score, 0);
    return (sum / validScores.length).toFixed(2);
}

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});