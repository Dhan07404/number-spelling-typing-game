//const isProUser = false; // Set to true when user has Pro access
const isProUser = true

const languageSelect = document.getElementById("language-select");
const rangeSelect = document.getElementById("range-select");
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
  english: [
    "one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty",
    "twenty-one","twenty-two","twenty-three","twenty-four","twenty-five","twenty-six","twenty-seven","twenty-eight","twenty-nine","thirty",
    "thirty-one","thirty-two","thirty-three","thirty-four","thirty-five","thirty-six","thirty-seven","thirty-eight","thirty-nine","forty",
    "forty-one","forty-two","forty-three","forty-four","forty-five","forty-six","forty-seven","forty-eight","forty-nine","fifty",
    "fifty-one","fifty-two","fifty-three","fifty-four","fifty-five","fifty-six","fifty-seven","fifty-eight","fifty-nine","sixty",
    "sixty-one","sixty-two","sixty-three","sixty-four","sixty-five","sixty-six","sixty-seven","sixty-eight","sixty-nine","seventy",
    "seventy-one","seventy-two","seventy-three","seventy-four","seventy-five","seventy-six","seventy-seven","seventy-eight","seventy-nine","eighty",
    "eighty-one","eighty-two","eighty-three","eighty-four","eighty-five","eighty-six","eighty-seven","eighty-eight","eighty-nine","ninety",
    "ninety-one","ninety-two","ninety-three","ninety-four","ninety-five","ninety-six","ninety-seven","ninety-eight","ninety-nine","one hundred"
  ],
  arabic: (() => {
    const units = ["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة"];
    const teens = ["عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"];
    const tens = ["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
    const prounits = ["","wahid","ithnan","thalatha","arba'a","khamsa","sitta","sab'a","thamaniya","tis'a"];
    const prouteens = ["ashara","ahada 'ashar","ithna 'ashar","thalatha 'ashar","arba'a 'ashar","khamsa 'ashar","sitta 'ashar","sab'a 'ashar","thamaniya 'ashar","tis'a 'ashar"];
    const protens = ["","","ishroon","thalatoun","arba'oun","khamsoun","sittoon","sab'oon","thamanioon","tis'oon"];
    const arr = [{ script: "", pron: "" }];
    for (let i = 1; i <= 100; i++) {
      let script = "", pron = "";
      if (i < 10) {
        script = units[i]; pron = prounits[i];
      } else if (i < 20) {
        script = teens[i - 10]; pron = prouteens[i - 10];
      } else if (i < 100) {
        const u = i % 10, t = Math.floor(i / 10);
        if (u === 0) {
          script = tens[t]; pron = protens[t];
        } else {
          script = `${units[u]} و${tens[t]}`;
          pron = `${protens[t]} wa ${prounits[u]}`;
        }
      } else {
        script = "مئة"; pron = "mi'a";
      }
      arr[i] = { script, pron };
    }
    return arr;
  })()
};

let currentLanguage = "english";
let currentNumbers = [];
let currentIndex = 0;
let gameActive = false;
let answers = [];
const maxHints = 3;
let hintsUsed = 0;
let startTime = 0;

// ** Paywall: lock premium ranges **
Array.from(rangeSelect.options).forEach(option => {
  if (option.dataset.premium && !isProUser) {
    option.disabled = true;
    option.textContent += " 🔒";
  }
});

function showSpellingList() {
  spellingList.innerHTML = "";
  if (gameActive) return;
  const language = languageSelect.value;
  const rangeLimit = parseInt(rangeSelect.value);
  if (language === "english") {
    spellings.english.slice(0, rangeLimit).forEach((word, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}: ${word}`;
      spellingList.appendChild(li);
    });
  } else {
    spellings.arabic.slice(1, rangeLimit + 1).forEach((w, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}: ${w.script} (${w.pron})`;
      spellingList.appendChild(li);
    });
  }
}

function startGame() {
  currentLanguage = languageSelect.value;
  const rangeLimit = parseInt(rangeSelect.value);
  currentNumbers = [...Array(rangeLimit).keys()].map(n => n + 1)
    .sort(() => Math.random() - 0.5).slice(0, 20);
  currentIndex = 0; answers = []; hintsUsed = 0; gameActive = false;

  spellingListContainer.style.display = "none";
  sentenceContainer.textContent = "Get ready...";
  correctAnswersList.innerHTML = "";
  incorrectAnswersList.innerHTML = "";
  spellingResultList.innerHTML = "";
  finalResults.innerHTML = "";
  hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;

  answerInput.disabled = true;
  submitBtn.disabled = true;
  hintBtn.disabled = true;
  restartBtn.disabled = true;
  languageSelect.disabled = true;
  rangeSelect.disabled = true;
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

function restartGame() { startGame(); }
function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/[\u064B-\u0652]/g, '');
}

function checkAnswer(input) {
  if (!gameActive) return;
  const number = currentNumbers[currentIndex];
  let correct = false, correctAnswer = "";
  if (currentLanguage === "english") {
    correctAnswer = spellings.english[number - 1];
    correct = normalizeAnswer(input) === correctAnswer;
  } else {
    const arabic = spellings.arabic[number];
    correctAnswer = `${arabic.script} (${arabic.pron})`;
    correct = normalizeAnswer(input) === normalizeAnswer(arabic.script)
           || normalizeAnswer(input) === arabic.pron.toLowerCase();
  }

  answers.push({ number, input, correct, correctAnswer });
  const resultItem = document.createElement("li");
  resultItem.textContent = `${number}: Your answer "${input}" is ${correct ? "Correct" : "Incorrect"} (Correct: ${correctAnswer})`;
  resultItem.style.color = correct ? "green" : "red";
  spellingResultList.appendChild(resultItem);

  const liFeedback = document.createElement("li");
  liFeedback.textContent = `${number}: ${input} → ${correctAnswer}`;
  (correct ? correctAnswersList : incorrectAnswersList).appendChild(liFeedback);

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
    rangeSelect.disabled = false;
    startBtn.disabled = false;
    sentenceContainer.textContent = "Game Over!";
    showResults();
    showSpellingList();
  } else {
    showNextNumber();
  }
}

function showNextNumber() {
  sentenceContainer.textContent = currentNumbers[currentIndex];
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
    <p><strong>Score:</strong> ${score}/${answers.length}</p>
    <p><strong>Accuracy:</strong> ${accuracy}%</p>
    <p><strong>WPM:</strong> ${wpm}</p>
    <p><strong>Hints used:</strong> ${hintsUsed}</p>
  `;
}

function useHint() {
  if (!gameActive || hintsUsed >= maxHints) return alert("No more hints!");
  const number = currentNumbers[currentIndex];
  const hint = currentLanguage === "english"
    ? spellings.english[number - 1]
    : `${spellings.arabic[number].script} (${spellings.arabic[number].pron})`;
  alert(`Hint: ${hint}`);
  hintsUsed++;
  hintsLeftDisplay.textContent = `Hints left: ${maxHints - hintsUsed}`;
  if (hintsUsed >= maxHints) hintBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
submitBtn.addEventListener("click", () => checkAnswer(answerInput.value));
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !submitBtn.disabled) checkAnswer(answerInput.value);
});
hintBtn.addEventListener("click", useHint);
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  if (!gameActive) spellingListContainer.style.display = "block";
  showSpellingList();
});
rangeSelect.addEventListener("change", () => {
  const sel = rangeSelect.selectedOptions[0];
  if (sel.dataset.premium && !isProUser) {
    alert("This range is for Pro users only.");
    rangeSelect.value = "10";
  
  }
  if (!gameActive) spellingListContainer.style.display = "block";
  showSpellingList();
});
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

// Initialize
showSpellingList();
hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;
