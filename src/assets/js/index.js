import { getRandomValue, getRandomWordArray, removeAllChildNodes, createStars, getSettingsFromLocalStorage } from './utils.js';
import { fetchWordsArrayBySettings } from './data.js';
import { playLaserSound } from './audio.js';

let wordSetList = [];
let writtingWordProgressArray = [];
let splittedCurrentlyWrittingWord = [];
let isAccentEngineActive = true;
let currentlyWrittingWord = '';
let completedWords = [];
let wordList = [];
let score = 0;
let scoreToWin = 25;
const defaultLevelArrayLength = 25;
const defaultFallDuration = 10;
const horizontalMaxPosition = 80;
const horizontalMinPosition = 10;
const fallDelaySeconds = 2;
const fallDurationSeconds = 0.3;
const wordContainerElement = document.querySelector('#word');
const scoreDomNode = document.querySelector("#score");
const loseModal = document.querySelector("#lose-dialog");
const losingScoreElement = document.querySelector("#losing-score");
const winModal = document.querySelector("#win-dialog");

const registerRestartEvent = () => {
    document.querySelectorAll('.restart-btn').forEach(item => {
        item.addEventListener('click', async (event) => {
            event.preventDefault();
            await restartGame();
        })
    })
};

const initializeWordArray = async () => {
    wordSetList = Array.from(new Set(structuredClone(await fetchWordsArrayBySettings())));
}

const setupLoseEvent = () => {
    // Verifica si la palabra esta debajo del ViewHeight cuando cae para que el usuario pierda  
    addEventListener("animationend", (event) => {
        if (!event.target.classList.contains('word-div')) return; // Ignore star animationend if any
        removeAllChildNodes(wordContainerElement);
        losingScoreElement.innerText = `Tu puntuación fue de: ${score} palabras`;
        loseModal.showModal();
    });
}

const showWinnerMessage = () => {
    winModal.showModal();
}

const restartGame = async () => {
    winModal.close();
    loseModal.close();
    
    // Clear the board
    removeAllChildNodes(wordContainerElement);
    
    // Remove stars to avoid hundreds of thousands over time
    document.querySelectorAll('.star').forEach(s => s.remove());
    
    // Reset state variables
    currentlyWrittingWord = '';
    writtingWordProgressArray = [];
    splittedCurrentlyWrittingWord = [];
    
    await initGame();
}

const showWordsInDom = () => {
    wordList = getRandomWordArray(wordSetList, defaultLevelArrayLength);
    wordList.forEach((word) => {
        const domNodeWithWord = buildWordDomNode(word);
        wordContainerElement.appendChild(domNodeWithWord);
    });
};

const buildWordDomNode = (word) => {
    const wordElement = document.createElement('div');
    const wordElementCount = document.querySelectorAll('.word-div').length;
    const horizontalPosition = `${getRandomValue(horizontalMaxPosition, horizontalMinPosition)}%`;
    const fallDelay = `${wordElementCount * fallDelaySeconds}s`;
    const fallDuration = `${defaultFallDuration - ((score / defaultLevelArrayLength) * fallDurationSeconds)}s`;
    wordElement.id = word;
    wordElement.classList = 'word-div';
    wordElement.style.animation = `fall ${fallDuration} ${fallDelay} linear`;
    wordElement.style.right = horizontalPosition;

    word.split('').forEach(letter => {
        const letterElement = document.createElement('span');
        letterElement.innerText = letter;
        wordElement.appendChild(letterElement);
    });

    return wordElement;
}

const shoot = () => {
    const targetWord = document.querySelector(`#${currentlyWrittingWord}`);
    if (!targetWord) return;
    const { x, y } = targetWord.getBoundingClientRect();
    const bullet = document.querySelector('#bullet');
    
    // Laser start position (near the ship roughly)
    bullet.style.transition = 'none';
    bullet.style.left = `50vw`;
    bullet.style.top = `100vh`;
    bullet.style.display = 'block';
    
    requestAnimationFrame(() => {
        bullet.style.transition = 'all 0.15s ease-out';
        bullet.style.left = `${x + 15}px`;
        bullet.style.top = `${y + 15}px`;
        bullet.style.boxShadow = '0px 0px 15px 5px #fb2bff, inset 0px 0px 5px 0px #fff'; 
        bullet.style.background = '#fb2bff';
    });

    setTimeout(() => {
        bullet.style.transition = 'none';
        bullet.style.top = '110vh';
        bullet.style.boxShadow = '';
        bullet.style.background = '';
        bullet.style.display = 'none';
    }, 150);
}

const moveShipHorizontally = () => {
    const { x } = document.querySelector(`#${currentlyWrittingWord}`).getBoundingClientRect();
    const rocketShip = document.querySelector("#rocket-ship");
    rocketShip.style.transition = "all 1s ease 0"
    rocketShip.style.left = `${x}px`;
}

const reactToShoot = (writtingWordProgressArray, splittedCurrentlyWrittingWord) => {
    writtingWordProgressArray.push(splittedCurrentlyWrittingWord.shift());
    const letterElem = document.querySelector(`#${currentlyWrittingWord}`).children[writtingWordProgressArray.length - 1];
    
    playLaserSound(); // Add audio feedback
    
    letterElem.style.transition = 'all 0.3s ease-out';
    letterElem.style.color = '#fb2bff';
    letterElem.style.textShadow = '0 0 20px #fb2bff, 0 0 40px #fff';
    letterElem.style.transform = 'scale(0.5)';
    letterElem.style.opacity = '0';
}

const updateScore = () => {
    score = completedWords.length;
    scoreDomNode.innerText = `${score}/${scoreToWin}`;
}

const checkIfUserWins = () => {
    return score === scoreToWin;
}

const createParticleExplosion = (x, y) => {
    for(let i=0; i<8; i++){
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '12px';
        particle.style.height = '12px';
        particle.style.backgroundColor = '#fb2bff';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 15px #fb2bff';
        particle.style.transition = 'all 0.6s cubic-bezier(0.1, 0.8, 0.3, 1)';
        particle.style.pointerEvents = 'none';
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60 + 30;
        
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${Math.cos(angle)*radius}px, ${Math.sin(angle)*radius}px) scale(0)`;
            particle.style.opacity = '0';
        });
        
        setTimeout(() => particle.remove(), 600);
    }
};

const handleCompletedWord = () => {
    const wordElem = document.querySelector(`#${currentlyWrittingWord}`);
    if (wordElem) {
        const rect = wordElem.getBoundingClientRect();
        createParticleExplosion(rect.x + (rect.width/2), rect.y + (rect.height/2));
        wordContainerElement.removeChild(wordElem);
    }
    completedWords.push(currentlyWrittingWord);
    wordList = wordList.filter(word => word !== currentlyWrittingWord);
    writtingWordProgressArray = [];
    currentlyWrittingWord = '';
}

//Acción o evento cuando se digita una tecla
const setupKeyTypingEvent = () => {
    document.addEventListener('keydown', function (event) {
        if (loseModal.open || winModal.open) return; // Ignore keys if game over
        
        let typedLetter = event.key.toLowerCase();

        // Accent UX Aura logic
        if (typedLetter === 'dead' && isAccentEngineActive) {
            document.body.classList.add('accent-screen-aura');
            return;
        } else {
            document.body.classList.remove('accent-screen-aura');
        }

        const foundWord = wordList.find(word => word && word[0] === typedLetter);
        let expectedChar = splittedCurrentlyWrittingWord[0];

        if (foundWord && !currentlyWrittingWord) {
            const { top } = document.querySelector(`#${foundWord}`)?.getBoundingClientRect() || {};
            if (top && top > 0) {
                currentlyWrittingWord = foundWord;
                splittedCurrentlyWrittingWord = foundWord.split('');
                moveShipHorizontally();
                shoot();
                reactToShoot(writtingWordProgressArray, splittedCurrentlyWrittingWord);
            }
        } else if (currentlyWrittingWord.length > 0 && expectedChar && typedLetter === expectedChar) {
            moveShipHorizontally();
            shoot();
            reactToShoot(writtingWordProgressArray, splittedCurrentlyWrittingWord);
        }

        if (writtingWordProgressArray.length > 0 && writtingWordProgressArray.join('') === currentlyWrittingWord) {
            handleCompletedWord();
            updateScore();
        }
        checkIfUserWins() ? showWinnerMessage() : wordList.length === 0 && showWordsInDom();
    });
}

const emptyCompletedWords = () => {
    completedWords = [];
}

const initGame = async () => {
    const gameSettings = getSettingsFromLocalStorage();
    const isMacOrLinux = !navigator.userAgent.includes('Win');
    isAccentEngineActive = !(isMacOrLinux || gameSettings?.['enable-accents'] !== 'on');

    emptyCompletedWords();
    await initializeWordArray();
    showWordsInDom();
    updateScore();
    createStars(100);
}

const setupGlobalEvents = () => {
    setupKeyTypingEvent();
    setupLoseEvent();
}

// Primer Evento
setupGlobalEvents();
initGame();
registerRestartEvent();