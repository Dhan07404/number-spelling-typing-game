const numbers = {
  english: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  french: ["un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"],
  spanish: ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
  arabic: ["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"]
};

let currentIndex = 0;
let currentLang = "english";
let score = 0;
let total = 10;
let hintsUsed = 0;
let startTime = null;
let correctCount = 0;
let randomizedIndices = [];

const numberDisplay = document.getElementById("number-question");
const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const results = document.getElementById("results");
const hintBtn = document.getElementById("hint-btn");
const hintCount = document.getElementById("hint-count");
const hintDisplay = document.getElementById("hint-display");
const languageSelect = document.getElementById("language-select");
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");

// Disable restart at the start
restartBtn.disabled = true;

// Utility to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function countdown(seconds, onComplete) {
  let counter = seconds;
  results.textContent = `Starting in ${counter}...`;
  userInput.disabled = true;
  submitBtn.disabled = true;
  startBtn.disabled = true;
  restartBtn.disabled = true;
  languageSelect.disabled = true;

  const intervalId = setInterval(() => {
    counter--;
    if (counter > 0) {
      results.textContent = `Starting in ${counter}...`;
    } else {
      clearInterval(intervalId);
      results.textContent = "";
      userInput.disabled = false;
      submitBtn.disabled = false;
      startBtn.disabled = true;
      restartBtn.disabled = false;
      languageSelect.disabled = false;
      onComplete();
    }
  }, 1000);
}

function startGame() {
  currentLang = languageSelect.value;
  currentIndex = 0;
  score = 0;
  hintsUsed = 0;
  correctCount = 0;
  hintDisplay.textContent = "";
  hintCount.textContent = `(3 hints remaining)`;
  results.textContent = "";
  userInput.value = "";
  userInput.disabled = false;
  submitBtn.disabled = false;

  randomizedIndices = shuffleArray([...Array(10).keys()]);

  startTime = new Date();
  askNext();
}

function askNext() {
  if (currentIndex < total) {
    const number = randomizedIndices[currentIndex] + 1;
    numberDisplay.textContent = `Spell the number: ${number}`;
    userInput.value = "";
    userInput.focus();
    hintDisplay.textContent = "";
  } else {
    // Game over
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    const wpm = (correctCount / timeTaken) * 60;
    const accuracy = ((score / total) * 100).toFixed(1);

    results.innerHTML = `
      Game Over!<br>
      Language: <strong>${capitalize(currentLang)}</strong><br>
      Score: ${score} / ${total} ${hintsUsed > 0 ? "(with hints)" : ""}<br>
      Accuracy: ${accuracy}%<br>
      WPM: ${wpm.toFixed(2)}<br>
      Time: ${timeTaken.toFixed(1)} seconds<br>
      Hints Used: ${hintsUsed}
    `;

    userInput.disabled = true;
    submitBtn.disabled = true;
  }
}

submitBtn.addEventListener("click", () => {
  const answer = userInput.value.trim().toLowerCase();
  const correct = numbers[currentLang][randomizedIndices[currentIndex]];

  if (answer === correct.toLowerCase()) {
    score++;
    correctCount += correct.split(" ").length;
    results.textContent = "Correct!";
  } else {
    results.textContent = `Incorrect. Correct was: "${correct}"`;
  }

  currentIndex++;
  setTimeout(() => {
    results.textContent = "";
    askNext();
  }, 1000);
});

hintBtn.addEventListener("click", () => {
  if (currentIndex >= total) return;
  if (hintsUsed < 3) {
    hintDisplay.textContent = `Hint: ${numbers[currentLang][randomizedIndices[currentIndex]]}`;
    hintsUsed++;
    hintCount.textContent = `(${3 - hintsUsed} hints remaining)`;
  } else {
    hintDisplay.textContent = "No hints remaining.";
  }
});

startBtn.addEventListener("click", () => {
  countdown(3, startGame);
});

restartBtn.addEventListener("click", () => {
  countdown(3, startGame);
});

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitBtn.click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeHint");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const banner = document.getElementById("instructions");
      if (banner) banner.style.display = "none";
    });
  }
});
