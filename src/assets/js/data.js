import { getSettingsFromLocalStorage } from './utils.js';

// Fetch from a massive, 80k word grammatical dictionary to guarantee high-quality words
let cachedDictionary = null;

const normalizeWord = (word) => {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const fetchDictionary = async () => {
    if (cachedDictionary) return cachedDictionary;
    try {
        const response = await fetch('https://raw.githubusercontent.com/javierarce/palabras/master/listado-general.txt');
        if (!response.ok) throw new Error("Dictionary fetch failed");
        const text = await response.text();
        
        // Parse the text file (newline-separated) and safely keep only valid alphabetical Spanish strings
        const allWords = text.split('\n')
                             .map(w => w.trim().toLowerCase())
                             .filter(w => /^[a-zñáéíóúü]+$/.test(w) && w.length >= 4 && w.length <= 12);
        
        cachedDictionary = allWords;
        return cachedDictionary;
    } catch (e) {
        console.error("Critical error loading dictionary", e);
        // Minimal absolute fallback if github fails, maintaining linguistic rules
        cachedDictionary = ["error", "conexión", "juego", "espacial", "nave", "asteroide", "perdón", "galaxia", "estrella"];
        return cachedDictionary;
    }
}

export const fetchWordsArrayBySettings = async () => {
    const dict = await fetchDictionary();
    
    const gameSettings = getSettingsFromLocalStorage();
    const isMacOrLinux = !navigator.userAgent.includes('Win');
    const shouldNormalize = isMacOrLinux || gameSettings?.['enable-accents'] !== 'on';

    // Pick unique 100 random words from the dictionary
    const randomWords = new Set();
    while (randomWords.size < 100) {
        let pickedWord = dict[Math.floor(Math.random() * dict.length)];
        if (shouldNormalize) {
            pickedWord = normalizeWord(pickedWord);
        }
        randomWords.add(pickedWord);
    }
    
    return Array.from(randomWords);
};