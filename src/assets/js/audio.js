// Utilidad de audio usando Web Audio API para no depender de archivos externos
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

export const playLaserSound = () => {
    initAudio();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square'; // Un tipo de onda con sonido retro
    
    // Configuración de la frecuencia para el sonido "pew"
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Frecuencia inicial
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2); // Caída rápida

    // Configuración del volumen (fade out)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volumen más bajo para no ser molesto
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    // Conectar los nodos
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Reproducir el sonido
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
};
