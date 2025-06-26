const numbers = {
  english: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  french: ["un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"],
  spanish: ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
  arabic: [
    { script: "واحد", translit: "wahid" },
    { script: "اثنان", translit: "ithnan" },
    { script: "ثلاثة", translit: "thalatha" },
    { script: "أربعة", translit: "arba'a" },
    { script: "خمسة", translit: "khamsa" },
    { script: "ستة", translit: "sitta" },
    { script: "سبعة", translit: "sab'a" },
    { script: "ثمانية", translit: "thamaniya" },
    { script: "تسعة", translit: "tis'a" },
    { script: "عشرة", translit: "ashara" }
  ]
};

const question = document.getElementById("number-question");
const userInput = document.getElementById("user-input");
const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const restartBtn = document.getElementById("restart-btn");
const results = document.getElementById("results");
const hintCount = document.getElementById("hint-count");
const hintDisplay = document.getElementById("hint-display");
const langSelect = document.getElementById("language-select");
const instructions = document.getElementById("instructions");
const closeHint = document.getElementById("closeHint");

let currentIndex = 0;
let randomizedIndices = [];
let score = 0;
let total = 10;
let currentLang = "english";
let hintsUsed = 0;
let correctCount = 0;
let startTime;

closeHint.onclick = () => instructions.style.display = "none";

function shuffleIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startCountdown(callback) {
  let count = 3;
  question.textContent = `Starting in ${count}...`;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      question.textContent = `Starting in ${count}...`;
    } else {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

function startGame() {
  currentLang = langSelect.value;
  randomizedIndices = shuffleIndices(10);
  currentIndex = 0;
  score = 0;
  hintsUsed = 0;
  correctCount = 0;
  results.textContent = "";
  hintDisplay.textContent = "";
  hintCount.textContent = "(3 hints remaining)";
  userInput.value = "";
  userInput.disabled = false;
  userInput.focus();
  startTime = Date.now();
  startBtn.disabled = true;
  submitBtn.disabled = false;
  restartBtn.disabled = false;
  askNext();
}

function askNext() {
  if (currentIndex >= total) return endGame();
  const num = randomizedIndices[currentIndex] + 1;
  question.textContent = `Spell ${num}`;
  userInput.value = "";
}

function endGame() {
  userInput.disabled = true;
  submitBtn.disabled = true;
  const timeTaken = (Date.now() - startTime) / 1000;
  const wpm = (score / timeTaken) * 60;
  const accuracy = (correctCount / total) * 100;

  results.innerHTML = `
    Score: ${score}/${total}<br>
    Time: ${timeTaken.toFixed(1)}s<br>
    WPM: ${wpm.toFixed(1)}<br>
    Accuracy: ${accuracy.toFixed(1)}%<br>
    Language: ${currentLang}<br>
    Hints Used: ${hintsUsed}
  `;
}

submitBtn.addEventListener("click", () => {
  const answer = userInput.value.trim().toLowerCase();
  const idx = randomizedIndices[currentIndex];

  let correctAnswer;
  let isCorrect = false;

  if (currentLang === "arabic") {
    correctAnswer = numbers.arabic[idx];
    isCorrect = (
      answer === correctAnswer.script ||
      answer === correctAnswer.translit.toLowerCase()
    );
  } else {
    correctAnswer = numbers[currentLang][idx];
    isCorrect = answer === correctAnswer.toLowerCase();
  }

  if (isCorrect) {
    score++;
    correctCount++;
    results.textContent = "Correct!";
  } else {
    if (currentLang === "arabic") {
      results.textContent = `Incorrect. Correct was: "${correctAnswer.script}" ( ${correctAnswer.translit} )`;
    } else {
      results.textContent = `Incorrect. Correct was: "${correctAnswer}"`;
    }
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
    const idx = randomizedIndices[currentIndex];

    if (currentLang === "arabic") {
      const word = numbers.arabic[idx];
      hintDisplay.textContent = `Hint: ${word.script} ( ${word.translit} )`;
    } else {
      hintDisplay.textContent = `Hint: ${numbers[currentLang][idx]}`;
    }

    hintsUsed++;
    hintCount.textContent = `(${3 - hintsUsed} hints remaining)`;
  } else {
    hintDisplay.textContent = "No hints remaining.";
  }
});

startBtn.addEventListener("click", () => {
  startCountdown(startGame);
});

restartBtn.addEventListener("click", () => {
  startCountdown(startGame);
});

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !submitBtn.disabled) {
    submitBtn.click();
  }
});
