const isProUser = true; // Set to true when user has Pro access

const languageSelect = document.getElementById("language-select");
const rangeSelect = document.getElementById("range-select");
const sentenceContainer = document.getElementById("sentence-container");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const hintsLeftDisplay = document.getElementById("hints-left");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const spellingListBtn = document.getElementById("spelling-list-btn");
const spellingListModal = document.getElementById("spelling-list-modal");
const spellingModal = document.getElementById("spelling-modal");
const spellingCloseBtn = document.getElementById("spelling-close-btn");
const correctAnswersList = document.getElementById("correct-answers-list");
const incorrectAnswersList = document.getElementById("incorrect-answers-list");
const finalResults = document.getElementById("final-results");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const upgradeBtn = document.getElementById("upgrade-btn");
const upgradeModal = document.getElementById("upgrade-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalUpgradeBtn = document.getElementById("modal-upgrade-btn");
const confettiCanvas = document.getElementById("confetti-canvas");
const confetti = new ConfettiGenerator({ target: confettiCanvas });
const timerDisplay = document.getElementById('timer-display');


const spellings = {
  english: [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
    "thirty-one", "thirty-two", "thirty-three", "thirty-four", "thirty-five", "thirty-six", "thirty-seven", "thirty-eight", "thirty-nine", "forty",
    "forty-one", "forty-two", "forty-three", "forty-four", "forty-five", "forty-six", "forty-seven", "forty-eight", "forty-nine", "fifty",
    "fifty-one", "fifty-two", "fifty-three", "fifty-four", "fifty-five", "fifty-six", "fifty-seven", "fifty-eight", "fifty-nine", "sixty",
    "sixty-one", "sixty-two", "sixty-three", "sixty-four", "sixty-five", "sixty-six", "sixty-seven", "sixty-eight", "sixty-nine", "seventy",
    "seventy-one", "seventy-two", "seventy-three", "seventy-four", "seventy-five", "seventy-six", "seventy-seven", "seventy-eight", "seventy-nine", "eighty",
    "eighty-one", "eighty-two", "eighty-three", "eighty-four", "eighty-five", "eighty-six", "eighty-seven", "eighty-eight", "eighty-nine", "ninety",
    "ninety-one", "ninety-two", "ninety-three", "ninety-four", "ninety-five", "ninety-six", "ninety-seven", "ninety-eight", "ninety-nine", "one hundred"
  ],
  arabic: (() => {
    const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const prounits = ["", "wahid", "ithnan", "thalatha", "arba'a", "khamsa", "sitta", "sab'a", "thamaniya", "tis'a"];
    const prouteens = ["ashara", "ahada 'ashar", "ithna 'ashar", "thalatha 'ashar", "arba'a 'ashar", "khamsa 'ashar", "sitta 'ashar", "sab'a 'ashar", "thamaniya 'ashar", "tis'a 'ashar"];
    const protens = ["", "", "ishroon", "thalatoun", "arba'oun", "khamsoun", "sittoon", "sab'oon", "thamanioon", "tis'oon"];
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
const maxHints = 5;
let hintsUsed = 0;
let startTime = 0;
let timerInterval;


// Paywall: lock premium ranges based on isProUser
function applyProLock() {
  Array.from(rangeSelect.options).forEach(option => {
    if (option.dataset.premium && !isProUser) {
      option.disabled = true;
      option.textContent = option.textContent.replace(" 🔒", "") + " 🔒";
    } else {
      option.disabled = false;
      option.textContent = option.textContent.replace(" 🔒", "");
    }
  });

  if (isProUser) {
    document.querySelectorAll(".pro-hidden").forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll(".pro-hidden").forEach(el => el.style.display = '');
  }
}

function showSpellingList() {
  spellingListModal.innerHTML = "";
  const language = languageSelect.value;
  const rangeLimit = parseInt(rangeSelect.value);
  const words = language === "english" ? spellings.english : spellings.arabic.slice(1);
  const listItems = words.slice(0, rangeLimit).map((item, i) => {
    const text = language === "english" ? `${i + 1}: ${item}` : `${i + 1}: ${item.script} (${item.pron})`;
    return `<li>${text}</li>`;
  }).join("");
  spellingListModal.innerHTML = listItems;
}

function startGame() {
  currentLanguage = languageSelect.value;
  const rangeLimit = parseInt(rangeSelect.value);
  currentNumbers = Array.from({ length: rangeLimit }, (_, i) => i + 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);
  currentIndex = 0;
  answers = [];
  hintsUsed = 0;
  gameActive = false;

  spellingModal.classList.add("hidden");
  sentenceContainer.textContent = "Get ready...";
  correctAnswersList.innerHTML = "";
  incorrectAnswersList.innerHTML = "";
  finalResults.innerHTML = "";
  hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;
  timerDisplay.textContent = 'Time: 00:00'; // Reset timer display


  answerInput.disabled = true;
  submitBtn.disabled = true;
  hintBtn.disabled = true;
  restartBtn.disabled = true;
  languageSelect.disabled = true;
  rangeSelect.disabled = true;
  startBtn.disabled = true;
  spellingListBtn.disabled = true;

  let countdown = 3;
  const interval = setInterval(() => {
    sentenceContainer.textContent = `Starting in ${countdown}...`;
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      gameActive = true;
      startTime = Date.now();
      startTimer();
      answerInput.disabled = false;
      submitBtn.disabled = false;
      hintBtn.disabled = false;
      restartBtn.disabled = false;
      answerInput.focus();
      showNextNumber();
    }
  }, 1000);
}

function startTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerDisplay.textContent = `Time: ${formattedTime}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}


function normalizeAnswer(str) {
  if (typeof str !== 'string') return '';
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
  } else {
    const arabic = spellings.arabic[number];
    correctAnswer = `${arabic.script} (${arabic.pron})`;
    correct = normalizeAnswer(input) === normalizeAnswer(arabic.script) || normalizeAnswer(input) === arabic.pron.toLowerCase();
  }

  answers.push({ number, input, correct, correctAnswer });
  updateFeedbackLists(number, input, correct, correctAnswer);

  currentIndex++;
  answerInput.value = "";
  hintProgress = 0;
  hintsLeftDisplay.textContent = `Hints left: ${maxHints - hintsUsed}`;

  if (currentIndex >= currentNumbers.length) {
    endGame();
  } else {
    showNextNumber();
  }
}

function updateFeedbackLists(number, input, correct, correctAnswer) {
  const liFeedback = document.createElement("li");
  liFeedback.textContent = `${number}: ${input} → ${correctAnswer}`;
  if (correct) {
    correctAnswersList.appendChild(liFeedback);
  } else {
    incorrectAnswersList.appendChild(liFeedback);
  }
}

function endGame() {
  gameActive = false;
  stopTimer();
  answerInput.disabled = true;
  submitBtn.disabled = true;
  hintBtn.disabled = true;
  restartBtn.disabled = false;
  languageSelect.disabled = false;
  rangeSelect.disabled = false;
  startBtn.disabled = false;
  spellingListBtn.disabled = false;
  sentenceContainer.textContent = "Game Over!";
  showResults();
  if (answers.every(a => a.correct)) {
    confetti.render();
    setTimeout(() => confetti.clear(), 5000);
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
  finalResults.innerHTML = `
    <h3>Results:</h3>
    <p><strong>Language:</strong> ${currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}</p>
    <p><strong>Time taken:</strong> ${Math.floor(timeElapsed / 60)}:${String(Math.floor(timeElapsed % 60)).padStart(2, '0')}</p>
    <p><strong>Score:</strong> ${score}/${answers.length}</p>
    <p><strong>Accuracy:</strong> ${accuracy}%</p>
    <p><strong>WPM:</strong> ${wpm}</p>
    <p><strong>Hints used:</strong> ${hintsUsed}</p>
  `;
}

let hintProgress = 0;
function useHint() {
  if (!gameActive || hintsUsed >= maxHints) {
    if (hintsUsed >= maxHints) alert("No more hints!");
    return;
  }
  const number = currentNumbers[currentIndex];
  const correctSpelling = currentLanguage === "english"
    ? spellings.english[number - 1]
    : spellings.arabic[number].script;

  if (hintProgress < correctSpelling.length) {
    const hint = correctSpelling.substring(0, hintProgress + 1);
    answerInput.value = hint;
    hintProgress++;
  } else {
    alert("Hint: No more letters to reveal.");
    return;
  }

  hintsUsed++;
  hintsLeftDisplay.textContent = `Hints left: ${maxHints - hintsUsed}`;
  if (hintsUsed >= maxHints) hintBtn.disabled = true;
}

// Event Listeners
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", () => checkAnswer(answerInput.value));
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !submitBtn.disabled) checkAnswer(answerInput.value);
});
hintBtn.addEventListener("click", useHint);
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  showSpellingList();
});
rangeSelect.addEventListener("change", () => {
  const sel = rangeSelect.selectedOptions[0];
  if (sel.dataset.premium && !isProUser) {
    rangeSelect.value = "10";
    upgradeModal.classList.remove("hidden");
  }
  showSpellingList();
});

// Dark mode toggle
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
});

// Upgrade Modal event listeners
upgradeBtn.addEventListener("click", () => {
  upgradeModal.classList.remove("hidden");
});

modalCloseBtn.addEventListener("click", () => {
  upgradeModal.classList.add("hidden");
});

modalUpgradeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Redirecting to upgrade page...");
  upgradeModal.classList.add("hidden");
});

// Spelling List Modal event listeners
spellingListBtn.addEventListener('click', () => {
    showSpellingList();
    spellingModal.classList.remove("hidden");
});

spellingCloseBtn.addEventListener('click', () => {
    spellingModal.classList.add("hidden");
});

// Confetti library for the win state
function ConfettiGenerator(options) {
  options = options || {};
  var target = document.getElementById(options.target);
  if (!target) return;

  var colors = options.colors || ["#f00", "#0f0", "#00f"];
  var count = options.count || 200;
  var speed = options.speed || 1;
  var particles = [];

  function createConfetti() {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * target.offsetWidth,
        y: Math.random() * -target.offsetHeight,
        r: Math.random() * 5 + 5,
        d: Math.random() * count,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5
      });
    }
  }

  function draw() {
    var ctx = target.getContext("2d");
    ctx.clearRect(0, 0, target.offsetWidth, target.offsetHeight);
    for (var i = 0; i < count; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.r / 2);
      ctx.stroke();
    }
    update();
  }

  function update() {
    for (var i = 0; i < count; i++) {
      var p = particles[i];
      p.y += Math.cos(p.d / 10) + p.r / 2;
      p.tilt += 0.1;
      if (p.y > target.offsetHeight) {
        particles[i] = {
          x: Math.random() * target.offsetWidth,
          y: Math.random() * -target.offsetHeight,
          r: p.r,
          d: p.d,
          color: p.color,
          tilt: Math.random() * 10 - 5
        };
      }
    }
  }

  function render() {
    target.style.display = 'block';
    createConfetti();
    (function animloop() {
      if (target.style.display !== 'none') {
        draw();
        requestAnimationFrame(animloop);
      }
    })();
  }

  function clear() {
    target.style.display = 'none';
    particles = [];
  }

  return {
    render: render,
    clear: clear
  };
}

// Initialize
applyProLock();
showSpellingList();
hintsLeftDisplay.textContent = `Hints left: ${maxHints}`;