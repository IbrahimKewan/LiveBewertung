// Verbindung zum Server herstellen
const socket = io('https://livewertung.onrender.com'); // ngrok-URL verwenden

// Globale Variablen
let users = []; // Liste der Benutzer

// ===================================
// Benutzer hinzufügen dd
// ===================================
function addUser() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Bitte einen Namen eingeben!');
        return;
    }

    // Neues Benutzer-Objekt erstellen
    const newUser = {
        name: name,
        score: 0 // Standardbewertung
    };

    // Benutzer an den Server senden
    socket.emit('newUser', newUser);

    // Eingabefeld leeren
    nameInput.value = '';
}

// ===================================
// Benutzerliste aktualisieren
// ===================================
function updateUserList(users) {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = ''; // Vorherige Benutzer entfernen

    users.forEach(user => {
        // Label für den Namen
        const label = document.createElement('label');
        label.textContent = user.name;
        label.htmlFor = `input-${user.name}`;

        // Input für die Bewertung
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `input-${user.name}`;
        input.value = user.score;
        input.min = 0;
        input.max = 200;

        // Validierung während der Eingabe (visuelles Feedback)
        input.addEventListener('input', () => {
            const value = parseInt(input.value, 10);
            if (value < 0 || value > 200) {
                input.style.borderColor = 'red'; // Zeige roten Rahmen bei ungültigen Werten
            } else {
                input.style.borderColor = ''; // Entferne den roten Rahmen bei gültigen Werten
            }
        });

        // Validierung erst nach Abschluss der Eingabe
        input.addEventListener('blur', () => {
            let score = parseInt(input.value, 10) || 0;

            // Validierung: Nur Werte zwischen 0 und 200 erlauben
            if (score < 0) score = 0;
            if (score > 200) score = 200;
            input.value = score;

            // Sende aktualisierte Bewertung an den Server
            socket.emit('updateScore', { name: user.name, score });
        });

        // Benutzer-Element hinzufügen
        const userDiv = document.createElement('div');
        userDiv.appendChild(label);
        userDiv.appendChild(input);
        userContainer.appendChild(userDiv);
    });
}

// ===================================
// Durchschnitt anzeigen
// ===================================
function updateAverage(average) {
    const averageDisplay = document.getElementById('averageDisplay');
    averageDisplay.textContent = `Durchschnitt: ${average}`;
}

// ===================================
// Socket.IO-Ereignisse
// ===================================

// Empfange aktualisierte Benutzerliste
socket.on('updateUsers', updatedUsers => {
    users = updatedUsers;
    updateUserList(users);
});

// Empfange aktualisierten Durchschnitt
socket.on('updateAverage', average => {
    updateAverage(average);
});