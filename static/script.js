const languageSelect = document.getElementById("language-select");
const sentenceContainer = document.getElementById("sentence-container");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const hintsLeftDisplay = document.getElementById("hints-left");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const spellingList = document.getElementById("spelling-list");
const spellingResultList = document.getElementById("spelling-result-list");
const spellingListContainer = document.getElementById("spelling-list-container");
const correctAnswersList = document.getElementById("correct-answers-list");
const incorrectAnswersList = document.getElementById("incorrect-answers-list");
const finalResults = document.getElementById("final-results");
const darkModeToggle = document.getElementById("dark-mode-toggle");

const spellings = {
  english: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  arabic: [
    { script: "واحد", pron: "wahid" },
    { script: "اثنان", pron: "ithnan" },
    { script: "ثلاثة", pron: "thalatha" },
    { script: "أربعة", pron: "arba'a" },
    { script: "خمسة", pron: "khamsa" },
    { script: "ستة", pron: "sitta" },
    { script: "سبعة", pron: "sab'a" },
    { script: "ثمانية", pron: "thamaniya" },
    { script: "تسعة", pron: "tis'a" },
    { script: "عشرة", pron: "ashara" }
  ]
};

let currentLanguage = "english";
let currentNumbers = [];
let currentIndex = 0;
let gameActive = false;

let answers = [];
let maxHints = 3;
let hintsUsed = 0;
let startTime = 0;

function showSpellingList() {
  spellingList.innerHTML = "";
  if (gameActive) return;

  const language = languageSelect.value;
  if (language === "english") {
    spellings.english.forEach((word, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}: ${word}`;
      spellingList.appendChild(li);
    });
  } else if (language === "arabic") {
    spellings.arabic.forEach((word, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}: ${word.script} (${word.pron})`;
      spellingList.appendChild(li);
    });
  }
}

function startGame() {
  currentLanguage = languageSelect.value;
  currentNumbers = [...Array(10).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
  currentIndex = 0;
  answers = [];
  hintsUsed = 0;
  gameActive = false;

  spellingListContainer.style.display = "none";
  sentenceContainer.textContent = "Get ready...";
  correctAnswersList.innerHTML = "";
  incorrectAnswersList.innerHTML = "";
  spellingResultList.innerHTML = "";
  finalResults.innerHTML = "";
  hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;
  hintBtn.disabled = false;

  answerInput.disabled = true;
  submitBtn.disabled = true;
  hintBtn.disabled = true;
  restartBtn.disabled = true;
  languageSelect.disabled = true;
  startBtn.disabled = true;

  let countdown = 3;
  const interval = setInterval(() => {
    sentenceContainer.textContent = `Starting in ${countdown}...`;
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      gameActive = true;
      startTime = Date.now();
      answerInput.disabled = false;
      submitBtn.disabled = false;
      hintBtn.disabled = false;
      restartBtn.disabled = false;
      answerInput.focus();
      showNextNumber();
    }
  }, 1000);
}

function restartGame() {
  startGame();
}

function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/[\u064B-\u0652]/g, '');
}

function checkAnswer(input) {
  if (!gameActive) return;

  const number = currentNumbers[currentIndex];
  let correct = false;
  let correctAnswer = "";

  if (currentLanguage === "english") {
    correctAnswer = spellings.english[number - 1];
    correct = normalizeAnswer(input) === correctAnswer;
  } else if (currentLanguage === "arabic") {
    const arabic = spellings.arabic[number - 1];
    const normInput = normalizeAnswer(input);
    const normScript = normalizeAnswer(arabic.script);
    const normPron = arabic.pron.toLowerCase();
    correctAnswer = `${arabic.script} (${arabic.pron})`;
    correct = normInput === normScript || normInput === normPron;
  }

  answers.push({ number, input, correct, correctAnswer });

  const resultItem = document.createElement("li");
  resultItem.textContent = `${number}: Your answer "${input}" is ${correct ? "Correct" : "Incorrect"} (Correct: ${correctAnswer})`;
  resultItem.style.color = correct ? "green" : "red";
  spellingResultList.appendChild(resultItem);

  const listItem = document.createElement("li");
  listItem.textContent = `${number}: ${input} → ${correctAnswer}`;
  if (correct) {
    correctAnswersList.appendChild(listItem);
  } else {
    incorrectAnswersList.appendChild(listItem);
  }

  currentIndex++;
  answerInput.value = "";
  hintsLeftDisplay.textContent = `Hints left: ${maxHints - hintsUsed}`;

  if (currentIndex >= currentNumbers.length) {
    gameActive = false;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    hintBtn.disabled = true;
    restartBtn.disabled = false;
    languageSelect.disabled = false;
    startBtn.disabled = false;
    sentenceContainer.textContent = "Game Over!";
    showResults();
    showSpellingList();
    return;
  }

  showNextNumber();
}

function showNextNumber() {
  const number = currentNumbers[currentIndex];
  sentenceContainer.textContent = `${number}`;
}

function showResults() {
  const timeElapsed = (Date.now() - startTime) / 1000;
  const score = answers.filter(a => a.correct).length;
  const accuracy = ((score / answers.length) * 100).toFixed(2);
  const wpm = ((score / timeElapsed) * 60).toFixed(2);
  spellingListContainer.style.display = "block";


  finalResults.innerHTML = `
    <h3>Results:</h3>
    <p><strong>Language:</strong> ${currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}</p>
    <p><strong>Score:</strong> ${score} / ${answers.length}</p>
    <p><strong>Accuracy:</strong> ${accuracy}%</p>
    <p><strong>Words Per Minute (WPM):</strong> ${wpm}</p>
    <p><strong>Hints used:</strong> ${hintsUsed}</p>
  `;
}

function useHint() {
  if (!gameActive) return;
  if (hintsUsed >= maxHints) {
    alert("No more hints left!");
    hintBtn.disabled = true;
    return;
  }

  const number = currentNumbers[currentIndex];
  let hint = "";

  if (currentLanguage === "english") {
    hint = spellings.english[number - 1];
  } else {
    const arabic = spellings.arabic[number - 1];
    hint = `${arabic.script} (${arabic.pron})`;
  }

  alert(`Hint: ${hint}`);
  hintsUsed++;
  hintsLeftDisplay.textContent = `Hints left: ${maxHints - hintsUsed}`;
  if (hintsUsed >= maxHints) hintBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
submitBtn.addEventListener("click", () => checkAnswer(answerInput.value));
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!submitBtn.disabled) checkAnswer(answerInput.value);
  }
});
hintBtn.addEventListener("click", useHint);
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  if (!gameActive) spellingListContainer.style.display = "block";
  showSpellingList();
});
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

showSpellingList();
hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;
