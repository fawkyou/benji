const CONFIG = {
  passcode: "310125",
  photos: [
    {
      src: "assets/photos/hug-cat.gif",
      alt: "A happy cat surrounded by hearts"
    }
  ],
  introMessages: [
    "you got the code right!",
    "but...",
    "i know you like puzzles",
    "so solve this one"
  ]
};

const BOARD_SIZE = 15;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const MINE_COUNT = 28;
const START_CLEAR_RADIUS = 2;
const MAX_BOARD_ATTEMPTS = 12;
const TYPE_SPEED = 56;
const MESSAGE_HOLD = 900;
const WRONG_RESET_DELAY = 900;
const CHESS_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const CHESS_PIECES = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
};
const CHESS_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const GIFT_FLOWERS = [
  "assets/gift/1.png",
  "assets/gift/2.png",
  "assets/gift/3.png",
  "assets/gift/4.png",
  "assets/gift/5.png",
  "assets/gift/6.png",
  "assets/gift/7.png"
];
const GIFT_FLOWER_IMAGES = GIFT_FLOWERS.map((src) => {
  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";
  image.src = src;
  return image;
});
const LETTER_LINES = [
  "ben,",
  "i don't even know where to begin because I have so many feelings for you and",
  "not enough words to explain them.",
  "you are the most important person in my life. not in a cute, overused way. i",
  "mean it in the most serious way possible. you are the best man i have ever",
  "met, and i will always be thankful that i get to love you. i love your beautiful",
  "green eyes.",
  "i was so used to being alone and keeping people away from me before you came",
  "along. i had pushed everyone away for so long that i really didn't think anyone",
  "could come into my life and change it the way you did. but then you showed up,",
  "and everything changed. better. more light. more at ease. like you were the only",
  "thing that could bring light to a world that had been dark for too long.",
  "you changed my life in ways that i don't think you fully understand. loving you",
  "has made me feel things i didn't know i needed. you make me feel safe, loved,",
  "seen, and understood in a way that i never thought i could.",
  "i love you so much that it can be too much for me at times, in a good way. you",
  "mean so much to me, and i hope you never doubt that. i care about you more than",
  "anything else, and i really can't imagine my life without you.",
  "i'll always be here for you, no matter what. i will always stand by you, i will",
  "support you, i will choose you. you have my heart completely and that will never",
  "change.",
  "thank you for being the best thing that has ever happened to me.",
  "i love you forever,",
  "maria"
];
const LETTER_TYPE_SPEED = 8;
const LETTER_LINE_PAUSE = 18;
const LOVE_HEART_TRAVEL_SECONDS = 50;
const GIFT_ORIGIN_X = 47.6;
const GIFT_ORIGIN_Y = 26.8;
const unlockStage = document.querySelector("#unlockStage");
const introStage = document.querySelector("#introStage");
const puzzleStage = document.querySelector("#puzzleStage");
const nextStage = document.querySelector("#nextStage");
const chessStage = document.querySelector("#chessStage");
const finalStage = document.querySelector("#finalStage");
const giftStage = document.querySelector("#giftStage");
const letterStage = document.querySelector("#letterStage");
const letterCopy = document.querySelector("#letterCopy");
const letterNextButton = document.querySelector("#letterNextButton");
const letterFinale = document.querySelector("#letterFinale");
const loveScene = document.querySelector(".love-scene");
const loveHeart = document.querySelector("#loveHeart");
const giftScene = document.querySelector("#giftScene");
const flowerCloud = document.querySelector("#flowerCloud");
const keypadPanel = document.querySelector("#keypadPanel");
const codeBoxes = [...document.querySelectorAll(".code-box")];
const statusMessage = document.querySelector("#statusMessage");
const heroPhoto = document.querySelector("#heroPhoto");
const typeMessage = document.querySelector("#typeMessage");
const mineBoard = document.querySelector("#mineBoard");
const lifeDisplay = document.querySelector("#lifeDisplay");
const puzzleMessage = document.querySelector("#puzzleMessage");
const newPuzzleButton = document.querySelector("#newPuzzleButton");
const skipPuzzleButton = document.querySelector("#skipPuzzleButton");
const skipModal = document.querySelector("#skipModal");
const confirmSkipButton = document.querySelector("#confirmSkipButton");
const cancelSkipButton = document.querySelector("#cancelSkipButton");
const nextTitle = document.querySelector("#nextTitle");
const nextMessage = document.querySelector("#nextMessage");
const finalTitle = document.querySelector("#finalTitle");
const finalMessage = document.querySelector("#finalMessage");
const chessBoard = document.querySelector("#chessBoard");
const chessTurnLabel = document.querySelector("#chessTurnLabel");
const chessMessage = document.querySelector("#chessMessage");
const newChessButton = document.querySelector("#newChessButton");
const skipChessButton = document.querySelector("#skipChessButton");
const chessWinModal = document.querySelector("#chessWinModal");

const neighborsByIndex = createNeighborMap();

let enteredCode = "";
let isLocked = false;
let photoIndex = 0;
let photoTimer = null;
let board = [];
let startIndex = 0;
let revealedSafeCount = 0;
let lives = 3;
let gameEnded = false;
let hintIndex = null;
let chessState = null;
let chessSelected = null;
let chessLegalMoves = [];
let chessLastMove = null;
let chessHintMove = null;
let chessBotThinking = false;
let chessFinished = false;
let chessAdvanceTimer = null;
let giftAdvanceTimer = null;
let letterRunId = 0;
let letterFinaleStarted = false;
let skipTarget = "puzzle";

function setupContent() {
  renderCurrentPhoto();

  if (CONFIG.photos.length > 1) {
    photoTimer = window.setInterval(nextPhoto, 4300);
  }
}

function renderCurrentPhoto() {
  const photo = CONFIG.photos[photoIndex] || CONFIG.photos[0];

  if (!photo) {
    return;
  }

  heroPhoto.src = photo.src;
  heroPhoto.alt = photo.alt || "A sweet memory";
}

function nextPhoto() {
  photoIndex = (photoIndex + 1) % CONFIG.photos.length;
  renderCurrentPhoto();
}

function updateCodeBoxes(mode = "normal") {
  codeBoxes.forEach((box, index) => {
    const hasValue = index < enteredCode.length;
    box.textContent = "";
    box.classList.toggle("has-value", hasValue);
    box.classList.toggle("is-wrong", mode === "wrong");

    if (mode === "wrong") {
      box.textContent = "X";
      return;
    }

    if (hasValue) {
      box.textContent = "*";
    }
  });
}

function pressButton(button) {
  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 160);
}

function addDigit(digit) {
  if (isLocked || enteredCode.length >= CONFIG.passcode.length) {
    return;
  }

  enteredCode += digit;
  updateCodeBoxes();

  if (enteredCode.length === CONFIG.passcode.length) {
    isLocked = true;
    window.setTimeout(checkCode, 180);
  }
}

function clearCode() {
  if (isLocked) {
    return;
  }

  enteredCode = "";
  updateCodeBoxes();
  statusMessage.textContent = "";
}

function deleteDigit() {
  if (isLocked) {
    return;
  }

  enteredCode = enteredCode.slice(0, -1);
  updateCodeBoxes();
}

function checkCode() {
  if (enteredCode === CONFIG.passcode) {
    unlockPage();
    return;
  }

  showWrongCode();
}

function showWrongCode() {
  keypadPanel.classList.add("is-wrong");
  updateCodeBoxes("wrong");
  statusMessage.textContent = "That date did not unlock it.";

  window.setTimeout(() => {
    enteredCode = "";
    isLocked = false;
    keypadPanel.classList.remove("is-wrong");
    updateCodeBoxes();
  }, WRONG_RESET_DELAY);
}

function unlockPage() {
  keypadPanel.classList.add("is-correct");
  statusMessage.textContent = "Unlocked.";
  burstHearts();

  window.setTimeout(() => {
    unlockStage.classList.add("is-leaving");
  }, 300);

  window.setTimeout(() => {
    unlockStage.classList.remove("is-active", "is-leaving");
    unlockStage.setAttribute("aria-hidden", "true");
    showStage(introStage);
    playIntroMessages();
  }, 1700);
}

async function playIntroMessages() {
  for (const message of CONFIG.introMessages) {
    typeMessage.classList.remove("is-hiding");
    typeMessage.textContent = "";
    await typeText(message);
    await wait(MESSAGE_HOLD);
    typeMessage.classList.add("is-hiding");
    await wait(360);
  }

  typeMessage.textContent = "";
  typeMessage.classList.remove("is-hiding");
  introStage.classList.remove("is-active");
  introStage.setAttribute("aria-hidden", "true");
  showStage(puzzleStage);
  startNewPuzzle();
}

function typeText(text) {
  return new Promise((resolve) => {
    let letterIndex = 0;

    const timer = window.setInterval(() => {
      typeMessage.textContent += text.charAt(letterIndex);
      letterIndex += 1;

      if (letterIndex >= text.length) {
        window.clearInterval(timer);
        resolve();
      }
    }, TYPE_SPEED);
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function showStage(stage) {
  stage.classList.add("is-active");
  stage.removeAttribute("aria-hidden");
}

function startNewPuzzle() {
  const generated = createSolvableBoard();

  board = generated.cells;
  startIndex = generated.startIndex;
  revealedSafeCount = 0;
  lives = 3;
  gameEnded = false;
  clearHint();
  renderLives();
  renderBoard();
  setHint(startIndex);
  setPuzzleMessage("Start with the glowing square.");
  closeSkipModal();
}

function createSolvableBoard() {
  let bestBoard = null;
  let bestScore = -1;

  for (let attempt = 0; attempt < MAX_BOARD_ATTEMPTS; attempt += 1) {
    const candidate = createRandomBoard();
    const openingScore = countOpeningSize(candidate.cells, candidate.startIndex);

    if (openingScore > bestScore) {
      bestBoard = candidate;
      bestScore = openingScore;
    }

    if (isBoardSolverFriendly(candidate.cells, candidate.startIndex)) {
      return candidate;
    }
  }

  return bestBoard || createRandomBoard();
}

function createRandomBoard() {
  const cells = Array.from({ length: TOTAL_CELLS }, (_, index) => ({
    index,
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
    mine: false,
    count: 0,
    revealed: false,
    flagged: false,
    mistake: false,
    el: null
  }));
  const startRow = randomInt(3, BOARD_SIZE - 4);
  const startCol = randomInt(3, BOARD_SIZE - 4);
  const start = getIndex(startRow, startCol);
  const forbidden = new Set();
  const mines = new Set();

  for (let row = startRow - START_CLEAR_RADIUS; row <= startRow + START_CLEAR_RADIUS; row += 1) {
    for (let col = startCol - START_CLEAR_RADIUS; col <= startCol + START_CLEAR_RADIUS; col += 1) {
      if (isInsideBoard(row, col)) {
        forbidden.add(getIndex(row, col));
      }
    }
  }

  while (mines.size < MINE_COUNT) {
    const index = randomInt(0, TOTAL_CELLS - 1);

    if (!forbidden.has(index)) {
      mines.add(index);
    }
  }

  mines.forEach((index) => {
    cells[index].mine = true;
  });

  cells.forEach((cell) => {
    if (!cell.mine) {
      cell.count = neighborsByIndex[cell.index].filter((neighbor) => cells[neighbor].mine).length;
    }
  });

  return {
    cells,
    startIndex: start
  };
}

function isBoardSolverFriendly(cells, firstIndex) {
  const revealed = new Set();
  const flagged = new Set();
  let progress = true;
  let guard = 0;

  revealForSolver(cells, firstIndex, revealed);

  while (progress && guard < TOTAL_CELLS) {
    const safeMoves = new Set();
    const mineMoves = new Set();
    const constraints = [];

    progress = false;
    guard += 1;

    for (const index of revealed) {
      const cell = cells[index];

      if (cell.mine) {
        return false;
      }

      const unknown = neighborsByIndex[index].filter((neighbor) => {
        return !revealed.has(neighbor) && !flagged.has(neighbor);
      });
      const flaggedNeighbors = neighborsByIndex[index].filter((neighbor) => flagged.has(neighbor)).length;
      const remainingMines = cell.count - flaggedNeighbors;

      if (remainingMines < 0 || remainingMines > unknown.length) {
        return false;
      }

      if (unknown.length === 0) {
        continue;
      }

      constraints.push({
        unknown,
        unknownSet: new Set(unknown),
        remainingMines
      });

      if (remainingMines === 0) {
        unknown.forEach((neighbor) => safeMoves.add(neighbor));
      }

      if (remainingMines === unknown.length) {
        unknown.forEach((neighbor) => mineMoves.add(neighbor));
      }
    }

    for (let a = 0; a < constraints.length; a += 1) {
      for (let b = a + 1; b < constraints.length; b += 1) {
        applySubsetRule(constraints[a], constraints[b], safeMoves, mineMoves);
        applySubsetRule(constraints[b], constraints[a], safeMoves, mineMoves);
      }
    }

    mineMoves.forEach((index) => {
      if (!flagged.has(index)) {
        flagged.add(index);
        progress = true;
      }
    });

    safeMoves.forEach((index) => {
      if (!revealed.has(index) && !flagged.has(index) && !cells[index].mine) {
        revealForSolver(cells, index, revealed);
        progress = true;
      }
    });
  }

  return revealed.size >= TOTAL_CELLS - MINE_COUNT;
}

function applySubsetRule(base, other, safeMoves, mineMoves) {
  if (!isSubset(base.unknownSet, other.unknownSet)) {
    return;
  }

  const difference = other.unknown.filter((index) => !base.unknownSet.has(index));
  const remainingDifference = other.remainingMines - base.remainingMines;

  if (difference.length === 0) {
    return;
  }

  if (remainingDifference === 0) {
    difference.forEach((index) => safeMoves.add(index));
  }

  if (remainingDifference === difference.length) {
    difference.forEach((index) => mineMoves.add(index));
  }
}

function isSubset(subset, fullSet) {
  for (const value of subset) {
    if (!fullSet.has(value)) {
      return false;
    }
  }

  return true;
}

function revealForSolver(cells, firstIndex, revealed) {
  const queue = [firstIndex];

  while (queue.length > 0) {
    const index = queue.shift();
    const cell = cells[index];

    if (revealed.has(index) || cell.mine) {
      continue;
    }

    revealed.add(index);

    if (cell.count === 0) {
      neighborsByIndex[index].forEach((neighbor) => {
        if (!revealed.has(neighbor) && !cells[neighbor].mine) {
          queue.push(neighbor);
        }
      });
    }
  }
}

function countOpeningSize(cells, firstIndex) {
  const opened = new Set();
  revealForSolver(cells, firstIndex, opened);
  return opened.size;
}

function renderBoard() {
  mineBoard.innerHTML = "";
  mineBoard.style.setProperty("--board-size", BOARD_SIZE);

  board.forEach((cell) => {
    const button = document.createElement("button");

    button.className = "mine-cell";
    button.type = "button";
    button.dataset.index = String(cell.index);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Hidden square row ${cell.row + 1}, column ${cell.col + 1}`);

    if ((cell.row + cell.col) % 2 === 0) {
      button.classList.add("is-light");
    } else {
      button.classList.add("is-dark");
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      toggleFlag(cell.index);
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openCell(cell.index);
    });

    cell.el = button;
    mineBoard.append(button);
    renderCell(cell);
  });
}

function renderCell(cell) {
  const button = cell.el;

  if (!button) {
    return;
  }

  button.classList.toggle("is-revealed", cell.revealed && !cell.mine);
  button.classList.toggle("is-flagged", cell.flagged);
  button.classList.toggle("is-mistake", cell.mistake);
  button.classList.remove("count-1", "count-2", "count-3", "count-4", "count-5", "count-6", "count-7", "count-8");
  button.innerHTML = "";

  if (cell.flagged && !cell.revealed) {
    button.innerHTML = '<span class="flag-heart" aria-hidden="true"></span>';
    button.setAttribute("aria-label", `Heart flag row ${cell.row + 1}, column ${cell.col + 1}`);
    return;
  }

  if (cell.mistake) {
    button.innerHTML = '<span class="mine-heart" aria-hidden="true"></span>';
    button.setAttribute("aria-label", `Mine found row ${cell.row + 1}, column ${cell.col + 1}`);
    return;
  }

  if (cell.revealed) {
    if (cell.count > 0) {
      button.textContent = String(cell.count);
      button.classList.add(`count-${cell.count}`);
    }

    button.setAttribute("aria-label", `Open square row ${cell.row + 1}, column ${cell.col + 1}`);
    return;
  }

  button.setAttribute("aria-label", `Hidden square row ${cell.row + 1}, column ${cell.col + 1}`);
}

function toggleFlag(index) {
  const cell = board[index];

  if (gameEnded || cell.revealed || cell.mistake) {
    return;
  }

  cell.flagged = !cell.flagged;
  renderCell(cell);
  checkForWin();
}

function openCell(index) {
  const cell = board[index];

  if (gameEnded || cell.revealed || cell.mistake) {
    return;
  }

  if (cell.flagged) {
    setPuzzleMessage("Remove the heart flag first.");
    return;
  }

  if (index === hintIndex) {
    clearHint();
  }

  if (cell.mine) {
    handleMineMistake(cell);
    return;
  }

  revealSafeArea(index);
  checkForWin();
}

function revealSafeArea(firstIndex) {
  const queue = [firstIndex];

  while (queue.length > 0) {
    const index = queue.shift();
    const cell = board[index];

    if (cell.revealed || cell.flagged || cell.mine || cell.mistake) {
      continue;
    }

    cell.revealed = true;
    revealedSafeCount += 1;
    renderCell(cell);

    if (index === hintIndex) {
      clearHint();
    }

    if (cell.count === 0) {
      neighborsByIndex[index].forEach((neighbor) => {
        const neighborCell = board[neighbor];

        if (!neighborCell.revealed && !neighborCell.flagged && !neighborCell.mine) {
          queue.push(neighbor);
        }
      });
    }
  }
}

function handleMineMistake(cell) {
  lives -= 1;
  cell.revealed = true;
  cell.mistake = true;
  cell.flagged = false;
  renderCell(cell);
  renderLives();
  burstHearts(12);

  if (lives <= 0) {
    gameEnded = true;
    revealAllMines();
    setPuzzleMessage("No lives left. Try a fresh puzzle.");
    return;
  }

  setPuzzleMessage(`${lives} ${lives === 1 ? "life" : "lives"} left.`);
}

function revealAllMines() {
  board.forEach((cell) => {
    if (cell.mine && !cell.mistake) {
      cell.mistake = true;
      renderCell(cell);
    }
  });
}

function checkForWin() {
  const revealedSafeCells = board.filter((cell) => !cell.mine && cell.revealed).length;
  const hasOpenedEverySafeCell = board.every((cell) => cell.mine || cell.revealed);

  revealedSafeCount = revealedSafeCells;

  if (!hasOpenedEverySafeCell) {
    return;
  }

  gameEnded = true;
  clearHint();
  board.forEach((cell) => {
    if (cell.mine && !cell.mistake) {
      cell.flagged = true;
      renderCell(cell);
    }
  });
  setPuzzleMessage("Puzzle solved! You did it <3");
  burstHearts(34);
  window.setTimeout(movePastPuzzle, 1500);
}

function renderLives() {
  lifeDisplay.innerHTML = "";

  for (let index = 0; index < 3; index += 1) {
    const heart = document.createElement("span");

    heart.className = "life-heart";

    if (index >= lives) {
      heart.classList.add("is-empty");
    }

    lifeDisplay.append(heart);
  }

  lifeDisplay.setAttribute("aria-label", `${lives} ${lives === 1 ? "life" : "lives"} left`);
}

function setPuzzleMessage(message) {
  puzzleMessage.textContent = message;
}

function openSkipModal(target = "puzzle") {
  skipTarget = target;
  skipModal.classList.add("is-open");
  skipModal.setAttribute("aria-hidden", "false");
  cancelSkipButton.focus();
}

function closeSkipModal() {
  skipModal.classList.remove("is-open");
  skipModal.setAttribute("aria-hidden", "true");
}

function skipPuzzle() {
  gameEnded = true;
  clearHint();
  closeSkipModal();
  burstHearts(18);
  movePastPuzzle();
}

function confirmSkipAction() {
  if (skipTarget === "chess") {
    skipChess();
    return;
  }

  skipPuzzle();
}

function movePastPuzzle() {
  if (puzzleStage.classList.contains("is-leaving") || !puzzleStage.classList.contains("is-active")) {
    return;
  }

  puzzleStage.classList.add("is-leaving");

  window.setTimeout(() => {
    puzzleStage.classList.remove("is-active", "is-leaving");
    puzzleStage.setAttribute("aria-hidden", "true");
    resetNextStageText();
    showStage(nextStage);
    playNextStageText();
  }, 1250);
}

function resetNextStageText() {
  nextTitle.textContent = "";
  nextMessage.textContent = "";
  nextTitle.classList.remove("is-typing");
  nextMessage.classList.remove("is-typing");
}

async function playNextStageText() {
  nextTitle.classList.add("is-typing");
  await typeIntoElement(nextTitle, nextTitle.dataset.text);
  nextTitle.classList.remove("is-typing");
  await wait(260);
  nextMessage.classList.add("is-typing");
  await typeIntoElement(nextMessage, nextMessage.dataset.text);
  nextMessage.classList.remove("is-typing");
  await wait(1100);
  showChessStage();
}

function resetFinalStageText() {
  finalTitle.textContent = "";
  finalMessage.textContent = "";
  finalTitle.classList.remove("is-typing");
  finalMessage.classList.remove("is-typing");
}

async function playFinalStageText() {
  finalTitle.classList.add("is-typing");
  await typeIntoElement(finalTitle, finalTitle.dataset.text);
  finalTitle.classList.remove("is-typing");
  await wait(260);
  finalMessage.classList.add("is-typing");
  await typeIntoElement(finalMessage, finalMessage.dataset.text);
  finalMessage.classList.remove("is-typing");
  await wait(1300);
  movePastFinalStage();
}

function movePastFinalStage() {
  if (finalStage.classList.contains("is-leaving") || !finalStage.classList.contains("is-active")) {
    return;
  }

  finalStage.classList.add("is-leaving");

  window.setTimeout(() => {
    finalStage.classList.remove("is-active", "is-leaving");
    finalStage.setAttribute("aria-hidden", "true");
    showStage(giftStage);
    playGiftScene();
  }, 1250);
}

function playGiftScene() {
  giftScene.classList.remove("is-playing");
  giftStage.classList.remove("is-leaving");
  resetLetterStage();
  buildGiftFlowers();
  void giftScene.offsetWidth;
  giftScene.classList.add("is-playing");

  if (giftAdvanceTimer) {
    window.clearTimeout(giftAdvanceTimer);
  }

  giftAdvanceTimer = window.setTimeout(() => {
    giftAdvanceTimer = null;
    movePastGift();
  }, 9600);
}

function movePastGift() {
  if (giftStage.classList.contains("is-leaving") || !giftStage.classList.contains("is-active")) {
    return;
  }

  giftStage.classList.add("is-leaving");

  window.setTimeout(() => {
    giftStage.classList.remove("is-active", "is-leaving");
    giftStage.setAttribute("aria-hidden", "true");
    flowerCloud.innerHTML = "";
    showStage(letterStage);
    playLetterStage();
  }, 1250);
}

function resetLetterStage() {
  letterRunId += 1;
  letterFinaleStarted = false;
  letterStage.classList.remove("is-written", "is-transitioning-finale", "is-finale-active");
  letterCopy.innerHTML = "";

  if (letterNextButton) {
    letterNextButton.disabled = true;
  }

  if (letterFinale) {
    letterFinale.setAttribute("aria-hidden", "true");
  }

  if (loveHeart) {
    loveHeart.innerHTML = "";
    loveHeart.style.removeProperty("--love-travel");
  }

  if (loveScene) {
    loveScene.querySelectorAll(".love-sparkle").forEach((sparkle) => sparkle.remove());
  }
}

async function playLetterStage() {
  const runId = letterRunId + 1;

  letterRunId = runId;
  letterStage.classList.remove("is-written");
  letterCopy.innerHTML = "";

  for (let lineIndex = 0; lineIndex < LETTER_LINES.length; lineIndex += 1) {
    if (runId !== letterRunId) {
      return;
    }

    const text = LETTER_LINES[lineIndex];
    const line = document.createElement("span");
    line.className = "letter-line is-typing";

    if (lineIndex === 0) {
      line.classList.add("is-salutation");
    }

    if (lineIndex >= LETTER_LINES.length - 2) {
      line.classList.add("is-signature");
    }

    letterCopy.append(line);
    await typeLetterLine(line, text, runId);
    line.classList.remove("is-typing");
    await wait(LETTER_LINE_PAUSE);
  }

  if (runId === letterRunId) {
    letterStage.classList.add("is-written");

    if (letterNextButton) {
      letterNextButton.disabled = false;
    }
  }
}

function beginLetterFinale() {
  if (
    letterFinaleStarted ||
    !letterStage.classList.contains("is-active") ||
    !letterStage.classList.contains("is-written")
  ) {
    return;
  }

  letterFinaleStarted = true;
  letterNextButton.disabled = true;
  letterStage.classList.add("is-transitioning-finale");

  window.setTimeout(() => {
    if (!letterStage.classList.contains("is-active")) {
      return;
    }

    letterStage.classList.remove("is-transitioning-finale");
    letterStage.classList.add("is-finale-active");
    letterFinale.setAttribute("aria-hidden", "false");
    buildLoveHeartScene();
  }, 760);
}

function typeLetterLine(element, text, runId) {
  return new Promise((resolve) => {
    let index = 0;

    function tick() {
      if (runId !== letterRunId) {
        resolve();
        return;
      }

      element.textContent += text.charAt(index);
      index += 1;

      if (index >= text.length) {
        resolve();
        return;
      }

      window.setTimeout(tick, LETTER_TYPE_SPEED);
    }

    tick();
  });
}

function loveHeartPoint(t) {
  const sine = Math.sin(t);

  return {
    x: 16 * sine * sine * sine,
    y:
      13.5 * Math.cos(t) -
      6.5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
  };
}

function buildLoveHeartScene() {
  if (!loveHeart || !loveScene) {
    return;
  }

  loveHeart.innerHTML = "";
  loveScene.querySelectorAll(".love-sparkle").forEach((sparkle) => sparkle.remove());

  const width = loveHeart.clientWidth;
  const height = loveHeart.clientHeight;

  if (!width || !height) {
    return;
  }

  const isMobile = window.innerWidth < 600;
  const travelSeconds = LOVE_HEART_TRAVEL_SECONDS;
  const wordCount = isMobile ? 34 : 68;
  const sampleCount = 120;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let index = 0; index <= sampleCount; index += 1) {
    const point = loveHeartPoint((index / sampleCount) * Math.PI * 2);
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const halfSize = Math.max(maxX - minX, maxY - minY) / 2;
  const scale = width * 0.335;
  let pathData = "";

  for (let index = 0; index <= sampleCount; index += 1) {
    const point = loveHeartPoint((index / sampleCount) * Math.PI * 2);
    const normalizedX = (point.x - centerX) / halfSize;
    const normalizedY = -(point.y - centerY) / halfSize;
    const x = width / 2 + normalizedX * scale;
    const y = height / 2 + normalizedY * scale;

    pathData += `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }

  pathData += "Z";

  let pathStyle = document.querySelector("#love-heart-path-style");

  if (!pathStyle) {
    pathStyle = document.createElement("style");
    pathStyle.id = "love-heart-path-style";
    document.head.append(pathStyle);
  }

  pathStyle.textContent = `.love-word--move{offset-path:path("${pathData}");}`;
  loveHeart.style.setProperty("--love-travel", `${travelSeconds}s`);

  const fontSize = isMobile
    ? Math.max(9, Math.round(width / 35))
    : Math.max(12, Math.round(width / 27));

  for (let index = 0; index < wordCount; index += 1) {
    const word = document.createElement("span");
    word.className = "love-word love-word--move";
    word.textContent = "I love you";
    word.style.fontSize = `${fontSize}px`;
    word.style.opacity = `${0.72 + Math.random() * 0.16}`;
    word.style.animationDelay = `${-((index / wordCount) * travelSeconds).toFixed(2)}s`;
    loveHeart.append(word);
  }

  const sparkleCount = isMobile ? 6 : 8;
  const sparkleRadius = width * (isMobile ? 0.42 : 0.46);

  for (let index = 0; index < sparkleCount; index += 1) {
    const sparkle = document.createElement("span");
    const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / sparkleCount) + ((Math.random() - 0.5) * 0.48);
    const distance = sparkleRadius + (Math.random() * (isMobile ? 24 : 38)) - (isMobile ? 8 : 12);
    const x = 50 + ((Math.cos(angle) * distance) / width) * 100;
    const y = 50 + ((Math.sin(angle) * distance) / height) * 100;
    const size = isMobile ? (6 + Math.random() * 5) : (7 + Math.random() * 7);
    const duration = 2.6 + Math.random() * 2.2;

    sparkle.className = "love-sparkle";
    sparkle.textContent = "\u2665";
    sparkle.style.left = `${x}%`;
    sparkle.style.top = `${y}%`;
    sparkle.style.setProperty("--sparkle-size", `${size}px`);
    sparkle.style.setProperty("--sparkle-duration", `${duration}s`);
    sparkle.style.setProperty("--sparkle-delay", `${-(Math.random() * duration).toFixed(2)}s`);
    sparkle.style.opacity = `${0.52 + Math.random() * 0.34}`;
    loveScene.append(sparkle);
  }
}

function buildGiftFlowers() {
  const assetBags = {
    spray: [],
    cover: []
  };
  const flowerFragment = document.createDocumentFragment();
  const sprayStart = 3.9;
  const coverStart = 4.58;
  const minX = -18;
  const maxX = 118;
  const minY = -10;
  const maxY = 110;
  const narrowViewport = window.innerWidth <= 760;
  const sprayCount = narrowViewport ? 16 : 18;

  flowerCloud.innerHTML = "";

  function refillAssetBag(weights) {
    const bag = [];

    weights.forEach((weight, index) => {
      for (let count = 0; count < weight; count += 1) {
        bag.push(index);
      }
    });

    return bag.sort(() => Math.random() - 0.5);
  }

  function nextFlowerAsset(kind = "cover") {
    const weights = kind === "spray"
      ? [4, 4, 4, 4, 3, 3, 2]
      : [4, 4, 4, 4, 4, 4, 3];

    if (assetBags[kind].length === 0) {
      assetBags[kind] = refillAssetBag(weights);
    }

    return assetBags[kind].pop();
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function addSprayFlower(x, y, size, delay, scale, rotation, duration) {
    const flower = document.createElement("img");
    const assetIndex = nextFlowerAsset("spray");
    const mouthJitterX = randomBetween(-6, 6);
    const mouthJitterY = randomBetween(-3.5, 3.5);
    const direction = x === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(x);
    const arcX = x * randomBetween(0.2, 0.36) + direction * randomBetween(1.8, 6.8);
    const arcY = Math.min(y - randomBetween(18, 30), -30 - Math.abs(x) * 0.08);
    const settleY = y - randomBetween(1.6, 3.2);

    flower.className = "gift-flower spray-flower";
    flower.src = GIFT_FLOWERS[assetIndex];
    flower.alt = "";
    flower.decoding = "async";
    flower.loading = "eager";
    flower.fetchPriority = "high";
    flower.style.setProperty("--sx", `${mouthJitterX}px`);
    flower.style.setProperty("--sy", `${mouthJitterY}px`);
    flower.style.setProperty("--mx", `${arcX}vw`);
    flower.style.setProperty("--my", `${arcY}vh`);
    flower.style.setProperty("--tx", `${x}vw`);
    flower.style.setProperty("--ty", `${y}vh`);
    flower.style.setProperty("--fy", `${settleY}vh`);
    flower.style.setProperty("--w", `clamp(${size}px, ${Math.max(9, size / 13)}vw, ${Math.round(size * 1.55)}px)`);
    flower.style.setProperty("--scale", String(scale));
    flower.style.setProperty("--scale-pop", String(scale + 0.08));
    flower.style.setProperty("--scale-end", String(scale + 0.04));
    flower.style.setProperty("--rotation", `${rotation}deg`);
    flower.style.setProperty("--delay", `${delay}s`);
    flower.style.setProperty("--duration", `${duration}s`);
    flower.style.setProperty(
      "--z",
      String(
        Math.round(
          58 +
          Math.max(0, -y) * 0.16 +
          size * 0.024 +
          randomBetween(-6, 8)
        )
      )
    );

    flowerFragment.append(flower);
  }

  function addCoverFlower(x, y, size, delay, scale, rotation, duration, layer) {
    const flower = document.createElement("img");
    const assetIndex = nextFlowerAsset("cover");
    const fallStart = y + randomBetween(20, 28);
    const fallMid = fallStart * randomBetween(0.42, 0.58);
    const fallXStart = randomBetween(-6.5, 6.5);
    const fallXMid = randomBetween(-3.8, 3.8);
    const fallXEnd = randomBetween(-1.3, 1.3);
    const settleLift = randomBetween(0.45, 1.35);

    flower.className = "gift-flower cover-flower";
    flower.src = GIFT_FLOWERS[assetIndex];
    flower.alt = "";
    flower.decoding = "async";
    flower.loading = "eager";
    flower.fetchPriority = "high";
    flower.style.setProperty("--flower-left", `${x}vw`);
    flower.style.setProperty("--flower-top", `${y}vh`);
    flower.style.setProperty("--fall-start", `${fallStart}vh`);
    flower.style.setProperty("--fall-mid", `${fallMid}vh`);
    flower.style.setProperty("--fall-x-start", `${fallXStart}vw`);
    flower.style.setProperty("--fall-x-mid", `${fallXMid}vw`);
    flower.style.setProperty("--fall-x-end", `${fallXEnd}vw`);
    flower.style.setProperty("--settle-lift", `${settleLift}vh`);
    flower.style.setProperty("--w", `clamp(${size}px, ${Math.max(10, size / 11)}vw, ${Math.round(size * 1.62)}px)`);
    flower.style.setProperty("--scale", String(scale));
    flower.style.setProperty("--scale-pop", String(scale + 0.08));
    flower.style.setProperty("--scale-end", String(scale + 0.02));
    flower.style.setProperty("--rotation", `${rotation}deg`);
    flower.style.setProperty("--delay", `${delay}s`);
    flower.style.setProperty("--duration", `${duration}s`);
    flower.style.setProperty("--z", String(layer));

    flowerFragment.append(flower);
  }

  for (let index = 0; index < sprayCount; index += 1) {
    const centerBias = Math.random() < 0.45;
    const angle = centerBias ? randomBetween(-1.88, -1.18) : randomBetween(-2.4, -0.72);
    const radius = centerBias ? randomBetween(16, 52) : randomBetween(18, 58);
    const x = Math.cos(angle) * radius * randomBetween(0.68, 1.08) + randomBetween(-3.2, 3.2);
    const y = Math.sin(angle) * radius * randomBetween(0.84, 1.08) + randomBetween(-3, 4.2);
    const size = randomBetween(92, 126);
    const delay = sprayStart + index * 0.017 + randomBetween(0, 0.04);
    const scale = randomBetween(0.86, 1.04);
    const rotation = randomBetween(-26, 26);

    addSprayFlower(x, y, size, delay, scale, rotation, randomBetween(1.58, 1.9));
  }

  const coverPoints = [];
  const coverageProbeX = narrowViewport ? 5.2 : 4.8;
  const coverageProbeY = narrowViewport ? 5.4 : 5;
  const coverageCols = Math.ceil((maxX - minX) / coverageProbeX) + 1;
  const coverageRows = Math.ceil((maxY - minY) / coverageProbeY) + 1;
  const baseSpacingX = narrowViewport ? 11.1 : 10;
  const baseSpacingY = narrowViewport ? 10.2 : 9.45;
  const fillerSpacingX = narrowViewport ? 12.7 : 11.6;
  const fillerSpacingY = narrowViewport ? 11.7 : 10.7;
  const centerReinforceCount = narrowViewport ? 20 : 28;
  const weakSpotPasses = narrowViewport ? 40 : 54;
  const randomScatterPasses = narrowViewport ? 30 : 40;
  const microFillPasses = narrowViewport ? 44 : 60;
  const probeMicroLimit = narrowViewport ? 40 : 56;
  const maxCoverPoints = narrowViewport ? 390 : 560;
  const coverageGrid = Array.from({ length: coverageRows }, () => Array(coverageCols).fill(0));
  const placedCenters = [];

  function coverageCellPosition(col, row) {
    return {
      x: minX + col * coverageProbeX,
      y: minY + row * coverageProbeY
    };
  }

  function addCoverage(x, y, radiusX, radiusY, strength = 1) {
    const startCol = clampNumber(Math.floor((x - radiusX - minX) / coverageProbeX), 0, coverageCols - 1);
    const endCol = clampNumber(Math.ceil((x + radiusX - minX) / coverageProbeX), 0, coverageCols - 1);
    const startRow = clampNumber(Math.floor((y - radiusY - minY) / coverageProbeY), 0, coverageRows - 1);
    const endRow = clampNumber(Math.ceil((y + radiusY - minY) / coverageProbeY), 0, coverageRows - 1);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const cell = coverageCellPosition(col, row);
        const normalizedX = (cell.x - x) / radiusX;
        const normalizedY = (cell.y - y) / radiusY;
        const distance = (normalizedX * normalizedX) + (normalizedY * normalizedY);

        if (distance <= 1.15) {
          coverageGrid[row][col] = Math.min(
            2.85,
            coverageGrid[row][col] + Math.max(0, strength * (1.16 - distance))
          );
        }
      }
    }
  }

  function sampleCoverage(x, y) {
    const centerCol = clampNumber(Math.round((x - minX) / coverageProbeX), 0, coverageCols - 1);
    const centerRow = clampNumber(Math.round((y - minY) / coverageProbeY), 0, coverageRows - 1);
    let total = 0;
    let count = 0;

    for (let row = Math.max(0, centerRow - 1); row <= Math.min(coverageRows - 1, centerRow + 1); row += 1) {
      for (let col = Math.max(0, centerCol - 1); col <= Math.min(coverageCols - 1, centerCol + 1); col += 1) {
        total += coverageGrid[row][col];
        count += 1;
      }
    }

    return count ? total / count : 0;
  }

  function hasCoverCapacity(buffer = 0) {
    return coverPoints.length + buffer < maxCoverPoints;
  }

  function nearestCenterDistance(x, y) {
    let nearest = Number.POSITIVE_INFINITY;

    for (const center of placedCenters) {
      const distance = Math.hypot(center.x - x, center.y - y);

      if (distance < nearest) {
        nearest = distance;
      }
    }

    return nearest;
  }

  function weakestCoverageCandidate() {
    let weakestScore = Number.POSITIVE_INFINITY;
    const candidates = [];

    for (let row = 0; row < coverageRows; row += 1) {
      for (let col = 0; col < coverageCols; col += 1) {
        const position = coverageCellPosition(col, row);
        const coverage = sampleCoverage(position.x, position.y);
        const edge = row < 2 || row > coverageRows - 3 || col < 2 || col > coverageCols - 3;
        const boxDistance = Math.hypot((position.x - 50) / 23, (position.y - 56) / 19);
        const target =
          (edge ? 1.08 : 1.28) +
          (boxDistance < 1.24 ? 0.38 : boxDistance < 1.64 ? 0.1 : 0) +
          (position.y > 76 ? 0.14 : 0);
        const score = coverage - target;

        if (score < weakestScore - 0.03) {
          weakestScore = score;
          candidates.length = 0;
        }

        if (score <= weakestScore + 0.12) {
          candidates.push({
            ...position,
            edge,
            coverage,
            target,
            score
          });
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((left, right) => left.score - right.score);
    return candidates[Math.floor(Math.random() * Math.min(6, candidates.length))];
  }

  function pushCoverPoint(x, y, { variant = "main", accent = false, edge = false, force = false } = {}) {
    if (!hasCoverCapacity()) {
      return false;
    }

    const pointX = clampNumber(x, minX - 10, maxX + 10);
    const pointY = clampNumber(y, minY - 10, maxY + 10);
    const minimumGap = variant === "main"
      ? 0.94
      : variant === "backfill"
        ? 0.52
        : 0.18;

    if (!force && nearestCenterDistance(pointX, pointY) < minimumGap) {
      return false;
    }

    coverPoints.push({
      x: pointX,
      y: pointY,
      accent,
      variant
    });

    placedCenters.push({ x: pointX, y: pointY });

    const radiusX = variant === "main"
      ? randomBetween(edge ? 10.4 : 9.9, edge ? 13 : 12.3) + (accent ? randomBetween(0.9, 1.9) : 0)
      : variant === "backfill"
        ? randomBetween(edge ? 7.2 : 6.8, edge ? 8.9 : 8.2)
        : randomBetween(edge ? 5.8 : 5.2, edge ? 6.9 : 6.2);
    const radiusY = variant === "main"
      ? randomBetween(edge ? 10 : 9.5, edge ? 12.8 : 12.1) + (accent ? randomBetween(0.9, 1.8) : 0)
      : variant === "backfill"
        ? randomBetween(edge ? 7 : 6.5, edge ? 8.7 : 8)
        : randomBetween(edge ? 5.6 : 5.1, edge ? 6.8 : 6.1);
    const strength = variant === "main"
      ? (edge ? 1.09 : 1.04) + (accent ? 0.05 : 0)
      : variant === "backfill"
        ? (edge ? 0.9 : 0.84)
        : (edge ? 0.72 : 0.68);

    addCoverage(pointX, pointY, radiusX, radiusY, strength);
    return true;
  }

  for (let rowIndex = 0, y = minY - 6; y <= maxY + 6 && hasCoverCapacity(); y += baseSpacingY, rowIndex += 1) {
    const rowShift = ((rowIndex % 2) * baseSpacingX * 0.38) + Math.sin(rowIndex * 0.9) * 1.5 + randomBetween(-1.3, 1.3);

    for (let x = minX - 6; x <= maxX + 6 && hasCoverCapacity(); x += baseSpacingX) {
      const edge = x < minX + 6 || x > maxX - 6 || y < minY + 6 || y > maxY - 6;
      const boxDistance = Math.hypot((x - 50) / 24, (y - 56) / 20);
      const waveX = Math.sin((x * 0.18) + (rowIndex * 0.74)) * 1.35;
      const waveY = Math.cos((x * 0.12) - (rowIndex * 0.66)) * 1.2;
      const skipChance = edge ? 0 : boxDistance < 1.16 ? 0.008 : 0.032;

      if (!edge && Math.random() < skipChance) {
        continue;
      }

      pushCoverPoint(
        x + rowShift + waveX + randomBetween(-2.4, 2.4),
        y + waveY + randomBetween(-2.2, 2.2),
        {
          variant: "main",
          edge,
          accent: boxDistance < 1.08 || Math.random() < 0.14
        }
      );
    }
  }

  for (let rowIndex = 0, y = minY - 4; y <= maxY + 4 && hasCoverCapacity(); y += fillerSpacingY, rowIndex += 1) {
    const rowShift = (((rowIndex + 1) % 2) * fillerSpacingX * 0.5) + Math.sin((rowIndex + 2) * 0.76) * 1.8;

    for (let x = minX - 4; x <= maxX + 4 && hasCoverCapacity(); x += fillerSpacingX) {
      const pointX = x + rowShift + randomBetween(-2.9, 2.9);
      const pointY = y + Math.cos((x * 0.09) + (rowIndex * 0.7)) * 1.1 + randomBetween(-2.8, 2.8);
      const edge = pointX < minX + 7 || pointX > maxX - 7 || pointY < minY + 7 || pointY > maxY - 7;
      const currentCoverage = sampleCoverage(pointX, pointY);

      if (currentCoverage > (edge ? 1.08 : 1.2) && Math.random() < 0.14) {
        continue;
      }

      pushCoverPoint(pointX, pointY, {
        variant: currentCoverage < 0.84 ? "main" : "backfill",
        edge,
        accent: currentCoverage < 0.8 && Math.random() < 0.28
      });
    }
  }

  for (let index = 0; index < centerReinforceCount && hasCoverCapacity(); index += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const radiusX = randomBetween(3, narrowViewport ? 20 : 24);
    const radiusY = randomBetween(2.5, narrowViewport ? 18 : 22);
    const anchorY = index % 2 === 0 ? 56 : 63;

    pushCoverPoint(
      50 + Math.cos(angle) * radiusX + randomBetween(-4.2, 4.2),
      anchorY + Math.sin(angle) * radiusY + randomBetween(-3.8, 3.8),
      {
        variant: index % 4 === 0 ? "main" : "backfill",
        accent: index % 3 === 0,
        edge: false,
        force: true
      }
    );
  }

  for (let pass = 0; pass < randomScatterPasses && hasCoverCapacity(); pass += 1) {
    const pointX = randomBetween(minX, maxX);
    const pointY = randomBetween(minY, maxY);
    const currentCoverage = sampleCoverage(pointX, pointY);
    const boxDistance = Math.hypot((pointX - 50) / 22, (pointY - 58) / 18);
    const edge = pointX < minX + 8 || pointX > maxX - 8 || pointY < minY + 8 || pointY > maxY - 8;

    if (currentCoverage > 1.14 && boxDistance > 1.18 && Math.random() < 0.5) {
      continue;
    }

    pushCoverPoint(
      pointX + randomBetween(-2.6, 2.6),
      pointY + randomBetween(-2.4, 2.4),
      {
        variant: currentCoverage < 0.9 || boxDistance < 1 ? "main" : "backfill",
        accent: boxDistance < 0.95 && Math.random() < 0.35,
        edge,
        force: boxDistance < 0.8
      }
    );
  }

  for (let pass = 0; pass < weakSpotPasses && hasCoverCapacity(); pass += 1) {
    const weakest = weakestCoverageCandidate();

    if (!weakest || weakest.coverage >= weakest.target) {
      break;
    }

    pushCoverPoint(
      weakest.x + randomBetween(-coverageProbeX * 0.7, coverageProbeX * 0.7),
      weakest.y + randomBetween(-coverageProbeY * 0.7, coverageProbeY * 0.7),
      {
        variant: pass % 4 === 0 ? "main" : "backfill",
        accent: pass % 5 === 0,
        edge: weakest.edge,
        force: true
      }
    );

    if (hasCoverCapacity() && (weakest.coverage < weakest.target - 0.16 || pass % 3 === 0)) {
      pushCoverPoint(
        weakest.x + randomBetween(-coverageProbeX * 0.56, coverageProbeX * 0.56),
        weakest.y + randomBetween(-coverageProbeY * 0.56, coverageProbeY * 0.56),
        {
          variant: weakest.coverage < weakest.target - 0.22 ? "main" : "backfill",
          accent: pass % 4 === 0,
          edge: weakest.edge,
          force: true
        }
      );
    }
  }

  for (let pass = 0; pass < microFillPasses && hasCoverCapacity(); pass += 1) {
    const weakest = weakestCoverageCandidate();

    if (!weakest || weakest.coverage >= weakest.target + 0.24) {
      break;
    }

    pushCoverPoint(
      weakest.x + randomBetween(-coverageProbeX * 0.46, coverageProbeX * 0.46),
      weakest.y + randomBetween(-coverageProbeY * 0.46, coverageProbeY * 0.46),
      {
        variant: "micro",
        accent: pass % 6 === 0,
        edge: weakest.edge,
        force: true
      }
    );

    if (hasCoverCapacity() && (pass % 2 === 0 || weakest.coverage < weakest.target - 0.08)) {
      pushCoverPoint(
        weakest.x + randomBetween(-coverageProbeX * 0.34, coverageProbeX * 0.34),
        weakest.y + randomBetween(-coverageProbeY * 0.34, coverageProbeY * 0.34),
        {
          variant: "micro",
          edge: weakest.edge,
          force: true
        }
      );
    }
  }

  const probeCandidates = [];

  for (let row = 0; row < coverageRows; row += 1) {
    for (let col = 0; col < coverageCols; col += 1) {
      const position = coverageCellPosition(col, row);
      const coverage = sampleCoverage(position.x, position.y);
      const edge = row < 2 || row > coverageRows - 3 || col < 2 || col > coverageCols - 3;
      const boxDistance = Math.hypot((position.x - 50) / 22, (position.y - 58) / 18);
      const threshold = (edge ? 1.04 : 1.2) + (boxDistance < 1.16 ? 0.14 : 0);

      if (coverage >= threshold) {
        continue;
      }

      probeCandidates.push({
        ...position,
        edge,
        boxDistance,
        priority: coverage - (boxDistance < 1.04 ? 0.08 : 0) + randomBetween(0, 0.14)
      });
    }
  }

  probeCandidates
    .sort((left, right) => left.priority - right.priority)
    .slice(0, probeMicroLimit)
    .forEach(({ x, y, edge, boxDistance }, index) => {
      if (!hasCoverCapacity()) {
        return;
      }

      pushCoverPoint(
        x + randomBetween(-coverageProbeX * 0.34, coverageProbeX * 0.34),
        y + randomBetween(-coverageProbeY * 0.34, coverageProbeY * 0.34),
        {
          variant: "micro",
          accent: boxDistance < 0.98 && index % 5 === 0,
          edge,
          force: true
        }
      );

      if (hasCoverCapacity() && (index % 3 === 0 || boxDistance < 1.04)) {
        pushCoverPoint(
          x + randomBetween(-coverageProbeX * 0.26, coverageProbeX * 0.26),
          y + randomBetween(-coverageProbeY * 0.26, coverageProbeY * 0.26),
          {
            variant: "micro",
            edge,
            force: true
          }
        );
      }
    });

  coverPoints
    .map(({ x, y, accent, variant }) => {
      const depth = clampNumber((y - minY) / (maxY - minY), 0, 1);
      const stackBias = randomBetween(-0.26, 0.28);

      return {
        x,
        y,
        accent,
        variant,
        depth,
        revealOrder: depth + randomBetween(-0.14, 0.14),
        stackBias
      };
    })
    .sort((left, right) => left.revealOrder - right.revealOrder)
    .forEach(({ x, y, accent, variant, depth, stackBias }, index) => {
      const backfill = variant === "backfill";
      const microfill = variant === "micro";
      const edge = x < 2 || x > 98 || y < 10 || y > 90;
      const extraSize = (edge ? randomBetween(microfill ? 8 : backfill ? 10 : 14, microfill ? 16 : backfill ? 20 : 26) : 0) + (accent ? randomBetween(microfill ? 8 : 12, microfill ? 18 : 24) : 0);
      const size = (
        microfill
          ? randomBetween(84, 110)
          : backfill
            ? randomBetween(112, 138)
            : randomBetween(154, 184)
      ) + extraSize;
      const delay = coverStart + depth * (microfill ? 1.02 : 1.06) + randomBetween(0, microfill ? 0.18 : 0.22);
      const scale = microfill ? randomBetween(0.92, 0.99) : backfill ? randomBetween(0.93, 1.01) : randomBetween(0.96, 1.04);
      const rotation = randomBetween(-22, 22);
      const duration = microfill ? randomBetween(1.48, 1.72) : backfill ? randomBetween(1.56, 1.82) : randomBetween(1.54, 1.84);
      const layer = Math.round(
        (microfill ? 96 : backfill ? 86 : 106) +
        index * (microfill ? 0.18 : backfill ? 0.22 : 0.42) +
        depth * (microfill ? 20 : backfill ? 18 : 26) +
        size * (microfill ? 0.02 : backfill ? 0.024 : 0.031) +
        stackBias * 30 +
        randomBetween(-8, 10)
      );

      addCoverFlower(x, y, size, delay, scale, rotation, duration, layer);
    });

  flowerCloud.append(flowerFragment);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function syncResponsiveSizing() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const narrow = viewportWidth <= 760;

  const puzzleShellWidth = Math.min(820, viewportWidth - 34);
  const puzzleBoardWidth = puzzleShellWidth - (narrow ? 54 : 66);
  const puzzleBoardHeight = viewportHeight - (narrow ? 320 : 330);
  const puzzleCell = Math.floor(Math.min(
    (puzzleBoardWidth - 16 - ((BOARD_SIZE - 1) * (narrow ? 2 : 3))) / BOARD_SIZE,
    (puzzleBoardHeight - 16 - ((BOARD_SIZE - 1) * (narrow ? 2 : 3))) / BOARD_SIZE
  ));

  const chessShellWidth = Math.min(860, viewportWidth - 34);
  const chessBoardWidth = chessShellWidth - (narrow ? 54 : 66);
  const chessBoardHeight = viewportHeight - (narrow ? 320 : 342);
  const chessCell = Math.floor(Math.min(
    (chessBoardWidth - 16) / 8,
    (chessBoardHeight - 16) / 8
  ));

  document.documentElement.style.setProperty("--mine-fit-cell", `${clampNumber(puzzleCell, narrow ? 16 : 18, narrow ? 22 : 27)}px`);
  document.documentElement.style.setProperty("--chess-fit-cell", `${clampNumber(chessCell, narrow ? 32 : 42, narrow ? 42 : 58)}px`);
}

function typeIntoElement(element, text) {
  return new Promise((resolve) => {
    let letterIndex = 0;

    const timer = window.setInterval(() => {
      element.textContent += text.charAt(letterIndex);
      letterIndex += 1;

      if (letterIndex >= text.length) {
        window.clearInterval(timer);
        resolve();
      }
    }, TYPE_SPEED);
  });
}

function showChessStage() {
  nextStage.classList.add("is-leaving");

  window.setTimeout(() => {
    nextStage.classList.remove("is-active", "is-leaving");
    nextStage.setAttribute("aria-hidden", "true");
    showStage(chessStage);
    startChessGame();
  }, 1200);
}

function skipChess() {
  chessFinished = true;
  chessBotThinking = false;
  clearChessSelection();
  closeSkipModal();
  burstHearts(18);
  movePastChess();
}

function movePastChess() {
  if (chessAdvanceTimer) {
    window.clearTimeout(chessAdvanceTimer);
    chessAdvanceTimer = null;
  }

  if (chessStage.classList.contains("is-leaving") || !chessStage.classList.contains("is-active")) {
    return;
  }

  chessStage.classList.add("is-leaving");

  window.setTimeout(() => {
    chessStage.classList.remove("is-active", "is-leaving");
    chessStage.setAttribute("aria-hidden", "true");
    resetFinalStageText();
    showStage(finalStage);
    playFinalStageText();
  }, 1250);
}

function scheduleChessAdvance() {
  if (chessAdvanceTimer) {
    window.clearTimeout(chessAdvanceTimer);
  }

  chessAdvanceTimer = window.setTimeout(() => {
    chessAdvanceTimer = null;
    showChessWinThenAdvance();
  }, 700);
}

function showChessWinThenAdvance() {
  if (chessStage.classList.contains("is-leaving") || !chessStage.classList.contains("is-active")) {
    return;
  }

  chessWinModal.classList.remove("is-dismissing");
  chessWinModal.classList.add("is-open");
  chessWinModal.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    chessStage.classList.add("is-leaving");
    chessWinModal.classList.add("is-dismissing");
  }, 1820);

  window.setTimeout(() => {
    chessWinModal.classList.remove("is-open", "is-dismissing");
    chessWinModal.setAttribute("aria-hidden", "true");
    chessStage.classList.remove("is-active", "is-leaving");
    chessStage.setAttribute("aria-hidden", "true");
    resetFinalStageText();
    showStage(finalStage);
    playFinalStageText();
  }, 3300);
}

function setHint(index) {
  clearHint();
  hintIndex = index;

  if (board[hintIndex] && board[hintIndex].el) {
    board[hintIndex].el.classList.add("is-hint");
  }
}

function clearHint() {
  if (hintIndex !== null && board[hintIndex] && board[hintIndex].el) {
    board[hintIndex].el.classList.remove("is-hint");
  }

  hintIndex = null;
}

function startChessGame() {
  if (chessAdvanceTimer) {
    window.clearTimeout(chessAdvanceTimer);
    chessAdvanceTimer = null;
  }

  chessState = createChessState();
  chessSelected = null;
  chessLegalMoves = [];
  chessLastMove = null;
  chessHintMove = null;
  chessBotThinking = false;
  chessFinished = false;
  closeSkipModal();
  renderChessBoard();
  updateChessStatus("your turn", "Take the queen and the bot gives up.");
}

function createChessState() {
  const pieces = {};
  const backRank = ["r", "n", "b", "q", "k", "b", "n", "r"];

  CHESS_FILES.forEach((file, index) => {
    pieces[`${file}1`] = { type: backRank[index], color: "w" };
    pieces[`${file}2`] = { type: "p", color: "w" };
    pieces[`${file}7`] = { type: "p", color: "b" };
    pieces[`${file}8`] = { type: backRank[index], color: "b" };
  });

  return {
    pieces,
    turn: "w",
    castling: {
      w: { k: true, q: true },
      b: { k: true, q: true }
    },
    enPassant: null
  };
}

function renderChessBoard() {
  chessBoard.innerHTML = "";

  for (let rank = 8; rank >= 1; rank -= 1) {
    for (let fileIndex = 0; fileIndex < CHESS_FILES.length; fileIndex += 1) {
      const square = `${CHESS_FILES[fileIndex]}${rank}`;
      const piece = chessState.pieces[square];
      const button = document.createElement("button");
      const legalMove = chessLegalMoves.find((move) => move.to === square);

      button.className = "chess-square";
      button.type = "button";
      button.dataset.square = square;
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", chessSquareLabel(square, piece));

      if ((fileIndex + rank) % 2 === 0) {
        button.classList.add("is-chess-light");
      } else {
        button.classList.add("is-chess-dark");
      }

      if (piece) {
        button.textContent = CHESS_PIECES[piece.color][piece.type];
        button.classList.add("has-piece", `piece-${piece.color}`);
      }

      if (square === chessSelected) {
        button.classList.add("is-selected");
      }

      if (legalMove) {
        button.classList.add("is-legal");

        if (legalMove.captured) {
          button.classList.add("is-capture");
        }
      }

      if (chessLastMove && (square === chessLastMove.from || square === chessLastMove.to)) {
        button.classList.add("is-last-move");
      }

      if (chessHintMove && (square === chessHintMove.from || square === chessHintMove.to)) {
        button.classList.add("is-suggested");
      }

      if (piece && piece.type === "k" && isKingInCheck(chessState, piece.color)) {
        button.classList.add("is-check");
      }

      button.addEventListener("click", () => handleChessSquare(square));
      chessBoard.append(button);
    }
  }
}

function chessSquareLabel(square, piece) {
  if (!piece) {
    return `Empty square ${square}`;
  }

  return `${piece.color === "w" ? "White" : "Black"} ${pieceName(piece.type)} on ${square}`;
}

function pieceName(type) {
  return {
    k: "king",
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
    p: "pawn"
  }[type];
}

function handleChessSquare(square) {
  if (chessFinished || chessBotThinking || chessState.turn !== "w") {
    return;
  }

  const piece = chessState.pieces[square];
  const chosenMove = chessLegalMoves.find((move) => move.to === square);

  if (chessSelected && chosenMove) {
    playChessMove(chosenMove, "player");
    return;
  }

  if (piece && piece.color === "w") {
    selectChessSquare(square);
    return;
  }

  clearChessSelection();
}

function selectChessSquare(square) {
  chessSelected = square;
  chessLegalMoves = generateLegalMovesForSquare(chessState, square);
  chessHintMove = null;
  renderChessBoard();
  updateChessStatus("your turn", chessLegalMoves.length ? "Pick a square." : "That piece is stuck.");
}

function clearChessSelection() {
  chessSelected = null;
  chessLegalMoves = [];
  chessHintMove = null;
  renderChessBoard();
}

function playChessMove(move, player) {
  applyChessMove(chessState, move);
  chessLastMove = { from: move.from, to: move.to };
  chessSelected = null;
  chessLegalMoves = [];
  chessHintMove = null;
  renderChessBoard();

  if (player === "player" && shouldBotResign()) {
    chessFinished = true;
    updateChessStatus("you won", "The bot gave up. You win <3");
    burstHearts(34);
    scheduleChessAdvance();
    return;
  }

  if (finishChessGameIfNeeded()) {
    return;
  }

  if (player === "player") {
    chessBotThinking = true;
    updateChessStatus("bot turn", "Bot is thinking...");

    window.setTimeout(playBotMove, 620);
  } else {
    updateChessStatus("your turn", isKingInCheck(chessState, "w") ? "Careful, your king is in check." : "Your move.");
  }
}

function shouldBotResign() {
  const blackHasQueen = Object.values(chessState.pieces).some((piece) => piece.color === "b" && piece.type === "q");
  const materialLead = materialScore("w") - materialScore("b");

  return !blackHasQueen || materialLead >= 10;
}

function materialScore(color) {
  return Object.values(chessState.pieces)
    .filter((piece) => piece.color === color)
    .reduce((total, piece) => total + CHESS_VALUES[piece.type], 0);
}

function playBotMove() {
  if (chessFinished || chessState.turn !== "b") {
    return;
  }

  const moves = generateLegalMoves(chessState, "b");

  if (moves.length === 0) {
    finishChessGameIfNeeded();
    return;
  }

  chessBotThinking = false;
  playChessMove(chooseEasyBotMove(moves), "bot");
}

function chooseEasyBotMove(moves) {
  const quietMoves = moves.filter((move) => !move.captured && !move.castle);
  const pool = quietMoves.length ? quietMoves : moves;

  return pool
    .map((move) => ({
      move,
      score: scoreBotMove(move) + Math.random() * 1.5
    }))
    .sort((a, b) => a.score - b.score)[0].move;
}

function scoreBotMove(move) {
  const clone = cloneChessState(chessState);
  const piece = clone.pieces[move.from];
  let score = 0;

  if (move.captured) {
    score += CHESS_VALUES[move.captured] * 14;
  }

  applyChessMove(clone, move);

  if (isKingInCheck(clone, "w")) {
    score += 18;
  }

  if (piece && isSquareAttacked(clone, move.to, "w")) {
    score -= CHESS_VALUES[piece.type] * 8;
  }

  if (piece && piece.type === "p") {
    score -= 1;
  }

  return score;
}

function finishChessGameIfNeeded() {
  const moves = generateLegalMoves(chessState, chessState.turn);

  if (moves.length > 0) {
    return false;
  }

  chessFinished = true;
  chessBotThinking = false;

  if (isKingInCheck(chessState, chessState.turn)) {
    if (chessState.turn === "b") {
      updateChessStatus("you won", "Checkmate! You beat the bot <3");
      burstHearts(34);
      scheduleChessAdvance();
    } else {
      updateChessStatus("bot won", "That bot got lucky. Try again?");
    }
  } else {
    updateChessStatus("draw", "A cute little draw.");
  }

  renderChessBoard();
  return true;
}

function showChessHint() {
  if (chessFinished || chessBotThinking || chessState.turn !== "w") {
    return;
  }

  const moves = generateLegalMoves(chessState, "w");

  if (moves.length === 0) {
    return;
  }

  chessHintMove = moves
    .map((move) => ({ move, score: scorePlayerMove(move) }))
    .sort((a, b) => b.score - a.score)[0].move;
  chessSelected = chessHintMove.from;
  chessLegalMoves = generateLegalMovesForSquare(chessState, chessSelected);
  renderChessBoard();
  updateChessStatus("hint", `Try ${chessHintMove.from} to ${chessHintMove.to}.`);
}

function scorePlayerMove(move) {
  const clone = cloneChessState(chessState);
  let score = 0;

  if (move.captured) {
    score += CHESS_VALUES[move.captured] * 12;
  }

  applyChessMove(clone, move);

  if (generateLegalMoves(clone, "b").length === 0 && isKingInCheck(clone, "b")) {
    score += 1000;
  }

  if (isKingInCheck(clone, "b")) {
    score += 18;
  }

  const piece = clone.pieces[move.to];

  if (piece && isSquareAttacked(clone, move.to, "b")) {
    score -= CHESS_VALUES[piece.type] * 2;
  }

  return score;
}

function updateChessStatus(turn, message) {
  chessTurnLabel.textContent = turn;
  chessMessage.textContent = message;
}

function generateLegalMovesForSquare(state, square) {
  const piece = state.pieces[square];

  if (!piece || piece.color !== state.turn) {
    return [];
  }

  return generateLegalMoves(state, piece.color).filter((move) => move.from === square);
}

function generateLegalMoves(state, color) {
  const moves = [];

  Object.keys(state.pieces).forEach((square) => {
    if (state.pieces[square].color === color) {
      moves.push(...generatePseudoMoves(state, square));
    }
  });

  return moves.filter((move) => move.captured !== "k").filter((move) => {
    const clone = cloneChessState(state);
    applyChessMove(clone, move);
    return !isKingInCheck(clone, color);
  });
}

function generatePseudoMoves(state, square) {
  const piece = state.pieces[square];

  if (!piece) {
    return [];
  }

  if (piece.type === "p") {
    return pawnMoves(state, square, piece);
  }

  if (piece.type === "n") {
    return jumpMoves(state, square, piece, [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2]
    ]);
  }

  if (piece.type === "b") {
    return slideMoves(state, square, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  }

  if (piece.type === "r") {
    return slideMoves(state, square, piece, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
  }

  if (piece.type === "q") {
    return slideMoves(state, square, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
  }

  return kingMoves(state, square, piece);
}

function pawnMoves(state, square, piece) {
  const moves = [];
  const { file, rank } = chessCoords(square);
  const direction = piece.color === "w" ? 1 : -1;
  const startRank = piece.color === "w" ? 2 : 7;
  const promoteRank = piece.color === "w" ? 8 : 1;
  const oneForward = chessSquare(file, rank + direction);

  if (oneForward && !state.pieces[oneForward]) {
    moves.push(chessMove(state, square, oneForward, piece, rank + direction === promoteRank ? "q" : null));

    const twoForward = chessSquare(file, rank + direction * 2);

    if (rank === startRank && twoForward && !state.pieces[twoForward]) {
      moves.push(chessMove(state, square, twoForward, piece));
    }
  }

  [-1, 1].forEach((fileOffset) => {
    const target = chessSquare(file + fileOffset, rank + direction);

    if (!target) {
      return;
    }

    const targetPiece = state.pieces[target];

    if (targetPiece && targetPiece.color !== piece.color) {
      moves.push(chessMove(state, square, target, piece, rank + direction === promoteRank ? "q" : null));
    }

    if (target === state.enPassant) {
      moves.push({ ...chessMove(state, square, target, piece), captured: "p", enPassant: true });
    }
  });

  return moves;
}

function jumpMoves(state, square, piece, offsets) {
  const { file, rank } = chessCoords(square);
  const moves = [];

  offsets.forEach(([fileOffset, rankOffset]) => {
    const target = chessSquare(file + fileOffset, rank + rankOffset);

    if (target && (!state.pieces[target] || state.pieces[target].color !== piece.color)) {
      moves.push(chessMove(state, square, target, piece));
    }
  });

  return moves;
}

function slideMoves(state, square, piece, directions) {
  const { file, rank } = chessCoords(square);
  const moves = [];

  directions.forEach(([fileOffset, rankOffset]) => {
    let nextFile = file + fileOffset;
    let nextRank = rank + rankOffset;

    while (chessSquare(nextFile, nextRank)) {
      const target = chessSquare(nextFile, nextRank);
      const targetPiece = state.pieces[target];

      if (!targetPiece) {
        moves.push(chessMove(state, square, target, piece));
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push(chessMove(state, square, target, piece));
        }

        break;
      }

      nextFile += fileOffset;
      nextRank += rankOffset;
    }
  });

  return moves;
}

function kingMoves(state, square, piece) {
  const moves = jumpMoves(state, square, piece, [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]]);
  const rank = piece.color === "w" ? 1 : 8;
  const enemy = oppositeColor(piece.color);

  if (square === `e${rank}` && !isKingInCheck(state, piece.color)) {
    const kingSideClear = !state.pieces[`f${rank}`] && !state.pieces[`g${rank}`];
    const queenSideClear = !state.pieces[`d${rank}`] && !state.pieces[`c${rank}`] && !state.pieces[`b${rank}`];

    if (
      state.castling[piece.color].k &&
      kingSideClear &&
      state.pieces[`h${rank}`]?.type === "r" &&
      !isSquareAttacked(state, `f${rank}`, enemy) &&
      !isSquareAttacked(state, `g${rank}`, enemy)
    ) {
      moves.push({ ...chessMove(state, square, `g${rank}`, piece), castle: "k" });
    }

    if (
      state.castling[piece.color].q &&
      queenSideClear &&
      state.pieces[`a${rank}`]?.type === "r" &&
      !isSquareAttacked(state, `d${rank}`, enemy) &&
      !isSquareAttacked(state, `c${rank}`, enemy)
    ) {
      moves.push({ ...chessMove(state, square, `c${rank}`, piece), castle: "q" });
    }
  }

  return moves;
}

function chessMove(state, from, to, piece, promotion = null) {
  return {
    from,
    to,
    piece: piece.type,
    color: piece.color,
    captured: state.pieces[to]?.type || null,
    promotion
  };
}

function applyChessMove(state, move) {
  const piece = state.pieces[move.from];
  const target = state.pieces[move.to];
  const fromCoords = chessCoords(move.from);
  const toCoords = chessCoords(move.to);

  delete state.pieces[move.from];

  if (move.enPassant) {
    const capturedRank = piece.color === "w" ? toCoords.rank - 1 : toCoords.rank + 1;
    delete state.pieces[chessSquare(toCoords.file, capturedRank)];
  }

  state.pieces[move.to] = {
    type: move.promotion || piece.type,
    color: piece.color
  };

  if (move.castle) {
    const rank = piece.color === "w" ? 1 : 8;
    const rookFrom = move.castle === "k" ? `h${rank}` : `a${rank}`;
    const rookTo = move.castle === "k" ? `f${rank}` : `d${rank}`;

    state.pieces[rookTo] = state.pieces[rookFrom];
    delete state.pieces[rookFrom];
  }

  updateCastlingRights(state, move, piece, target);
  state.enPassant = null;

  if (piece.type === "p" && Math.abs(toCoords.rank - fromCoords.rank) === 2) {
    state.enPassant = chessSquare(fromCoords.file, (fromCoords.rank + toCoords.rank) / 2);
  }

  state.turn = oppositeColor(state.turn);
}

function updateCastlingRights(state, move, piece, target) {
  if (piece.type === "k") {
    state.castling[piece.color].k = false;
    state.castling[piece.color].q = false;
  }

  if (piece.type === "r") {
    removeRookCastlingRight(state, piece.color, move.from);
  }

  if (target && target.type === "r") {
    removeRookCastlingRight(state, target.color, move.to);
  }
}

function removeRookCastlingRight(state, color, square) {
  const rank = color === "w" ? 1 : 8;

  if (square === `h${rank}`) {
    state.castling[color].k = false;
  }

  if (square === `a${rank}`) {
    state.castling[color].q = false;
  }
}

function isKingInCheck(state, color) {
  const kingSquare = Object.keys(state.pieces).find((square) => {
    const piece = state.pieces[square];
    return piece.type === "k" && piece.color === color;
  });

  return kingSquare ? isSquareAttacked(state, kingSquare, oppositeColor(color)) : true;
}

function isSquareAttacked(state, square, byColor) {
  const { file, rank } = chessCoords(square);
  const pawnDirection = byColor === "w" ? -1 : 1;
  const pawnAttackers = [
    chessSquare(file - 1, rank + pawnDirection),
    chessSquare(file + 1, rank + pawnDirection)
  ];

  if (pawnAttackers.some((attacker) => state.pieces[attacker]?.type === "p" && state.pieces[attacker]?.color === byColor)) {
    return true;
  }

  const knightOffsets = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

  if (knightOffsets.some(([fileOffset, rankOffset]) => {
    const attacker = chessSquare(file + fileOffset, rank + rankOffset);
    return state.pieces[attacker]?.type === "n" && state.pieces[attacker]?.color === byColor;
  })) {
    return true;
  }

  if (rayAttacked(state, file, rank, byColor, [[1, 0], [-1, 0], [0, 1], [0, -1]], ["r", "q"])) {
    return true;
  }

  if (rayAttacked(state, file, rank, byColor, [[1, 1], [1, -1], [-1, 1], [-1, -1]], ["b", "q"])) {
    return true;
  }

  return [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]].some(([fileOffset, rankOffset]) => {
    const attacker = chessSquare(file + fileOffset, rank + rankOffset);
    return state.pieces[attacker]?.type === "k" && state.pieces[attacker]?.color === byColor;
  });
}

function rayAttacked(state, file, rank, byColor, directions, types) {
  return directions.some(([fileOffset, rankOffset]) => {
    let nextFile = file + fileOffset;
    let nextRank = rank + rankOffset;

    while (chessSquare(nextFile, nextRank)) {
      const piece = state.pieces[chessSquare(nextFile, nextRank)];

      if (piece) {
        return piece.color === byColor && types.includes(piece.type);
      }

      nextFile += fileOffset;
      nextRank += rankOffset;
    }

    return false;
  });
}

function cloneChessState(state) {
  const pieces = {};

  Object.keys(state.pieces).forEach((square) => {
    pieces[square] = { ...state.pieces[square] };
  });

  return {
    pieces,
    turn: state.turn,
    enPassant: state.enPassant,
    castling: {
      w: { ...state.castling.w },
      b: { ...state.castling.b }
    }
  };
}

function chessCoords(square) {
  return {
    file: CHESS_FILES.indexOf(square.charAt(0)),
    rank: Number(square.charAt(1))
  };
}

function chessSquare(file, rank) {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) {
    return null;
  }

  return `${CHESS_FILES[file]}${rank}`;
}

function oppositeColor(color) {
  return color === "w" ? "b" : "w";
}

function createNeighborMap() {
  return Array.from({ length: TOTAL_CELLS }, (_, index) => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const neighbors = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        const nextRow = row + rowOffset;
        const nextCol = col + colOffset;

        if ((rowOffset !== 0 || colOffset !== 0) && isInsideBoard(nextRow, nextCol)) {
          neighbors.push(getIndex(nextRow, nextCol));
        }
      }
    }

    return neighbors;
  });
}

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getIndex(row, col) {
  return row * BOARD_SIZE + col;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function burstHearts(total = 26) {
  const burstLayer = document.createElement("div");
  const colors = ["#fffaf2", "#ffd1de", "#ffe3c4", "#ff8eb1"];

  burstLayer.className = "heart-burst";

  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / total;
    const distance = 110 + Math.random() * 180;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    heart.className = "burst-heart";
    heart.style.setProperty("--x", `${x}px`);
    heart.style.setProperty("--y", `${y}px`);
    heart.style.setProperty("--r", `${Math.random() * 320 - 160}deg`);
    heart.style.setProperty("--size", `${14 + Math.random() * 13}px`);
    heart.style.setProperty("--heart-color", colors[index % colors.length]);
    burstLayer.append(heart);
  }

  document.body.append(burstLayer);
  window.setTimeout(() => burstLayer.remove(), 1600);
}

document.addEventListener("click", (event) => {
  const digitButton = event.target.closest("[data-digit]");
  const actionButton = event.target.closest("[data-action]");

  if (digitButton) {
    pressButton(digitButton);
    addDigit(digitButton.dataset.digit);
    return;
  }

  if (actionButton) {
    pressButton(actionButton);

    if (actionButton.dataset.action === "clear") {
      clearCode();
    }

    if (actionButton.dataset.action === "backspace") {
      deleteDigit();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && skipModal.classList.contains("is-open")) {
    closeSkipModal();
    return;
  }

  if (/^\d$/.test(event.key)) {
    addDigit(event.key);
  }

  if (event.key === "Backspace") {
    deleteDigit();
  }

  if (event.key === "Escape") {
    clearCode();
  }
});

newPuzzleButton.addEventListener("click", startNewPuzzle);
skipPuzzleButton.addEventListener("click", () => openSkipModal("puzzle"));
confirmSkipButton.addEventListener("click", confirmSkipAction);
cancelSkipButton.addEventListener("click", closeSkipModal);
newChessButton.addEventListener("click", startChessGame);
skipChessButton.addEventListener("click", () => openSkipModal("chess"));
letterNextButton.addEventListener("click", beginLetterFinale);
skipModal.addEventListener("click", (event) => {
  if (event.target === skipModal) {
    closeSkipModal();
  }
});

window.addEventListener("resize", () => {
  syncResponsiveSizing();

  if (letterStage.classList.contains("is-finale-active")) {
    window.requestAnimationFrame(buildLoveHeartScene);
  }
});

syncResponsiveSizing();
setupContent();
