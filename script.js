const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const numberSpellings = {
  english: {
    1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
    6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten"
  },
  french: {
    1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
    6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix"
  },
  spanish: {
    1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez"
  },
  arabic: {
    1: "wahid", 2: "ithnayn", 3: "thalatha", 4: "arba'a", 5: "khamsa",
    6: "sitta", 7: "sab'a", 8: "thamaniya", 9: "tis'a", 10: "ashara"
  }
};

let shuffledNumbers = [];
let currentIndex = 0;
let score = 0;
let selectedLang = "english";

let hintsUsed = 0;
const maxHints = 3;

let startTime, endTime;

const languageSelect = document.getElementById("languageSelect");
const numberDisplay = document.getElementById("numberDisplay");
const inputBox = document.getElementById("inputBox");
const submitBtn = document.getElementById("submitBtn");
const startBtn = document.getElementById("startBtn");
const feedback = document.getElementById("feedback");
const gameContainer = document.getElementById("gameContainer");
const resultsContainer = document.getElementById("resultsContainer");

const hintBtn = document.getElementById("hintBtn");
const hintDisplay = document.getElementById("hintDisplay");
const hintTracker = document.getElementById("hintTracker");

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkInput);
hintBtn.addEventListener("click", showHint);

function startGame() {
  selectedLang = languageSelect.value;
  shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
  currentIndex = 0;
  score = 0;
  hintsUsed = 0;

  hintDisplay.textContent = "";
  hintTracker.textContent = `Hints used: 0 / ${maxHints}`;
  feedback.textContent = "";
  inputBox.value = "";

  resultsContainer.style.display = "none";
  gameContainer.style.display = "block";

  startTime = new Date();

  showNextNumber();
}

function showNextNumber() {
  const currentNum = shuffledNumbers[currentIndex];
  numberDisplay.textContent = `Spell this number in ${selectedLang}: ${currentNum}`;
  inputBox.focus();
}

function checkInput() {
  const userAnswer = inputBox.value.trim().toLowerCase();
  const currentNum = shuffledNumbers[currentIndex];
  const correctAnswer = numberSpellings[selectedLang][currentNum].toLowerCase();

  if (userAnswer === correctAnswer) {
    feedback.textContent = "Correct!";
    score++;
  } else {
    feedback.textContent = `Incorrect. The correct spelling of ${currentNum} in ${selectedLang} is "${correctAnswer}".`;
  }

  hintDisplay.textContent = "";
  inputBox.value = "";
  currentIndex++;

  if (currentIndex < shuffledNumbers.length) {
    showNextNumber();
  } else {
    endGame();
  }
}

function showHint() {
  if (hintsUsed < maxHints && currentIndex < shuffledNumbers.length) {
    const currentNum = shuffledNumbers[currentIndex];
    const correctSpelling = numberSpellings[selectedLang][currentNum];
    hintDisplay.textContent = `Hint: ${currentNum} = "${correctSpelling}"`;
    hintsUsed++;
    hintTracker.textContent = `Hints used: ${hintsUsed} / ${maxHints}`;
  } else {
    hintDisplay.textContent = "No more hints available.";
  }
}

function endGame() {
  endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000; // in seconds
  const wpm = (score / timeTaken) * 60;
  const accuracy = (score / shuffledNumbers.length) * 100;
  const hintNote = hintsUsed > 0 ? " (Hints used)" : " (No hints used)";

  gameContainer.style.display = "none";
  resultsContainer.style.display = "block";

  resultsContainer.innerHTML = `
    <h2>Results</h2>
    <p>Language: ${selectedLang}</p>
    <p>Score: ${score} / ${shuffledNumbers.length}</p>
    <p>Accuracy: ${accuracy.toFixed(2)}%</p>
    <p>Time Taken: ${timeTaken.toFixed(2)} seconds</p>
    <p>Words per Minute: ${wpm.toFixed(2)}</p>
    <p>Hints used: ${hintsUsed} / ${maxHints}${hintNote}</p>
  `;
}
