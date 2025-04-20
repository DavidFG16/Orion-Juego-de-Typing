let playerName = ""; // Variable para almacenar el nombre del jugador
const scores = []; // Array para almacenar las puntuaciones y nombres

// Maneja el envío del formulario para guardar el nombre del jugador
document.getElementById("playerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Obtiene el nombre ingresado por el jugador
    playerName = document.getElementById("playerName").value;

    // Deshabilita el formulario y habilita el botón para jugar
    document.getElementById("playerForm").style.display = "none";
    document.getElementById("playGame").disabled = false;
});

// Maneja el evento de hacer clic en "Jugar Partida"
document.getElementById("playGame").addEventListener("click", function() {
    // Si el nombre del jugador está vacío, no se permite continuar
    if (playerName === "") {
        alert("Por favor, ingresa tu nombre antes de jugar.");
        return;
    }

    // Aquí se debería calcular o asignar la puntuación obtenida en la partida
    // Por ejemplo, podrías tener una función que calcule la puntuación en base a la lógica de tu juego
    const playerScore = obtenerPuntuacionDeLaPartida(); // Obtén la puntuación real del jugador

    // Agrega el nombre y la puntuación al array de puntuaciones
    scores.push({ name: playerName, score: playerScore });

    // Ordena el array de puntuaciones de mayor a menor
    scores.sort((a, b) => b.score - a.score);

    // Actualiza la tabla con las posiciones
    updateTable();
});

// Función para actualizar la tabla con las posiciones correctas
function updateTable() {
    const tableBody = document.querySelector("#scoreTable tbody");
    tableBody.innerHTML = ""; // Limpia la tabla antes de actualizarla

    scores.forEach((player, index) => {
        const newRow = document.createElement("tr");

        // Crea las celdas para la posición, el nombre y la puntuación
        const positionCell = document.createElement("td");
        positionCell.textContent = index + 1;
        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;
        const scoreCell = document.createElement("td");
        scoreCell.textContent = player.score;

        // Agrega las celdas a la fila
        newRow.appendChild(positionCell);
        newRow.appendChild(nameCell);
        newRow.appendChild(scoreCell);

        // Agrega la nueva fila al cuerpo de la tabla
        tableBody.appendChild(newRow);
    });
}

// Función que simula obtener la puntuación de la partida (modifícala según la lógica de tu juego)
function obtenerPuntuacionDeLaPartida() {
    // Aquí deberías implementar la lógica para obtener la puntuación real del jugador
    // Por ejemplo, podría ser una puntuación calculada en función de su desempeño en la partida
    // Por ahora, esta función devolverá un valor fijo como ejemplo:
    return 75; // Cambia este valor o la lógica según tu juego
}