/* ════════════════════════════════════════════════════════
   HAMNA'S BIRTHDAY WEBSITE — script.js
   ════════════════════════════════════════════════════════

   SECTIONS:
   A. Page Navigation System
   B. Floating Hearts Background
   C. Confetti System
   D. Candle Blow Interaction
   E. Birthday Message Typewriter Effect
   F. Initialisation (runs on page load)

   🔧 HOW TO CUSTOMISE:
   - To change the birthday message → find BIRTHDAY_MESSAGE
   - To change heart emojis        → find HEART_EMOJIS array
   - To change confetti colors     → find CONFETTI_COLORS array
   - To add more pages             → update TOTAL_PAGES constant

   ════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────
   A. PAGE NAVIGATION SYSTEM
   ──────────────────────────────────────────────────────
   - currentPage tracks which page is active
   - goToPage(n) switches between pages with fade animation
   - HTML buttons call goToPage(2), goToPage(3) etc.
   ────────────────────────────────────────────────────── */

// 🔧 CHANGE: Update this if you add more pages to HTML
const TOTAL_PAGES = 5;   // pages are numbered 0–5

let currentPage = 0;   // starts on page 0 (countdown)

/**
 * Navigate to a specific page number.
 * Hides the current page, shows the target page.
 * @param {number} pageNum — the page to show (1 to TOTAL_PAGES)
 */
function goToPage(pageNum) {
  // Bounds check — pages 0 to TOTAL_PAGES
  if (pageNum < 0 || pageNum > TOTAL_PAGES) return;

  // Hide old page
  const oldPage = document.getElementById(`page${currentPage}`);
  if (oldPage) oldPage.classList.remove('active');

  // Show new page
  currentPage = pageNum;
  const newPage = document.getElementById(`page${currentPage}`);
  if (newPage) newPage.classList.add('active');

  // Launch confetti on certain page arrivals
  // 🔧 CHANGE: Add/remove page numbers from this array
  const confettiPages = [2, 4, 5];
  if (confettiPages.includes(pageNum)) {
    launchConfetti();
  }

  // Reset cake when navigating back to page 4
  if (pageNum === 4) {
    resetCake();
  }
}


/* ──────────────────────────────────────────────────────
   B. FLOATING HEARTS BACKGROUND
   ──────────────────────────────────────────────────────
   Creates floating heart/flower emojis that drift upward.
   🔧 CHANGE: add/remove emojis from HEART_EMOJIS array
             adjust HEART_COUNT for more/fewer hearts
             adjust spawnInterval for spawn speed
   ────────────────────────────────────────────────────── */

// 🔧 CHANGE: Emojis that float up in the background
const HEART_EMOJIS = ['💕', '🌸', '💖', '🌺', '✨', '💗', '🌷', '💝'];

// 🔧 CHANGE: Max number of floating hearts on screen at once
const HEART_COUNT = 16;

let heartPool = [];   // tracks active heart elements

/**
 * Spawn a single floating heart element and animate it upward.
 */
function spawnHeart() {
  const container = document.getElementById('heartsBg');
  if (!container) return;

  // Don't spawn too many at once
  if (heartPool.length >= HEART_COUNT) return;

  const el = document.createElement('div');
  el.classList.add('heart');

  // Random emoji from the list
  el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

  // Random horizontal position
  el.style.left = `${Math.random() * 95}%`;

  // Random size
  const size = 1 + Math.random() * 1.2;
  el.style.fontSize = `${size}rem`;

  // Random animation duration (6–14s)
  const duration = 6 + Math.random() * 8;
  el.style.animationDuration = `${duration}s`;

  // Random delay so they don't all appear at once
  el.style.animationDelay = `${Math.random() * 3}s`;

  container.appendChild(el);
  heartPool.push(el);

  // Remove element from DOM after animation ends
  setTimeout(() => {
    el.remove();
    heartPool = heartPool.filter(h => h !== el);
  }, (duration + 3) * 1000);
}

// Spawn hearts at regular intervals
// 🔧 CHANGE: lower number = faster heart spawning (in ms)
const heartInterval = setInterval(spawnHeart, 900);


/* ──────────────────────────────────────────────────────
   C. CONFETTI SYSTEM
   ──────────────────────────────────────────────────────
   Renders colourful confetti pieces on an HTML canvas.
   Triggered automatically on certain page transitions.
   ────────────────────────────────────────────────────── */

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx    = confettiCanvas.getContext('2d');
let   confettiPieces = [];
let   confettiRunning = false;

// Resize canvas to window
function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 🔧 CHANGE: Confetti piece colors
const CONFETTI_COLORS = [
  '#ff69b4', '#e91e8c', '#f48fb1', '#ffb6d9',
  '#ffe4f0', '#ffd700', '#ff8fab', '#ce93d8'
];

/**
 * Create a fresh batch of confetti pieces falling from the top.
 * @param {number} count — number of confetti pieces
 */
function createConfettiPieces(count = 180) {
  confettiPieces = [];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x:      Math.random() * confettiCanvas.width,
      y:      -10 - Math.random() * 250,          // start above viewport
      w:      5 + Math.random() * 8,              // width of piece
      h:      8 + Math.random() * 6,              // height of piece
      color:  CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx:     -2.5 + Math.random() * 5,           // horizontal drift
      vy:     2   + Math.random() * 4,            // fall speed
      rot:    Math.random() * 360,                // rotation angle
      rotV:   -4  + Math.random() * 8,            // rotation speed
      alpha:  1                                   // opacity
    });
  }
}

/**
 * Draw & update one frame of confetti animation.
 * Stops automatically when all pieces fade out.
 */
function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let anyAlive = false;

  for (const p of confettiPieces) {
    // Move piece
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;

    // Fade out once past halfway down the screen
    if (p.y > confettiCanvas.height * 0.55) p.alpha -= 0.014;
    if (p.alpha <= 0) continue;

    anyAlive = true;

    // Draw rotated rectangle
    confettiCtx.save();
    confettiCtx.globalAlpha = p.alpha;
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rot * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  }

  if (anyAlive) {
    requestAnimationFrame(drawConfetti);
  } else {
    // Clear canvas and mark as finished
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiRunning = false;
  }
}

/**
 * Public function: launch a confetti burst.
 * Calling it while already running resets the animation.
 */
function launchConfetti() {
  confettiRunning = true;
  createConfettiPieces(180);
  drawConfetti();
}


/* ──────────────────────────────────────────────────────
   D. CANDLE BLOW INTERACTION — PAGE 4
   ──────────────────────────────────────────────────────
   When user clicks the cake:
   1. Each candle flame fades out with a stagger delay
   2. Smoke puff appears above each candle
   3. After all candles out → typewriter message starts
   4. After message done → celebration gif appears
   ────────────────────────────────────────────────────── */

// 🔧 CHANGE: How many candles are on the cake (match HTML)
const CANDLE_COUNT = 5;

let candlesBlown = false;   // prevent double-clicking

/**
 * Blow out all candles one by one with stagger.
 * Called by onclick on .cake-container in HTML.
 */
function blowCandles() {
  // Only blow once per visit to page 4
  if (candlesBlown) return;
  candlesBlown = true;

  // Hide the "click to blow" hint text
  const hint = document.getElementById('cakeHint');
  if (hint) hint.style.opacity = '0';

  // Blow each candle with a staggered delay
  // 🔧 CHANGE: adjust delay multiplier (200ms) for faster/slower blow
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    setTimeout(() => {
      blowSingleCandle(i);
    }, i * 200);   // 200ms between each candle
  }

  // After all candles are out, start typewriter
  // Delay = CANDLE_COUNT * 200ms + small pause
  setTimeout(() => {
    typeMessage();
    launchConfetti();
  }, CANDLE_COUNT * 200 + 600);
}

/**
 * Blow out a single candle by index (1-based).
 * Adds .blown class to flame, spawns smoke puff.
 * @param {number} index — candle number (1 to CANDLE_COUNT)
 */
function blowSingleCandle(index) {
  const flame = document.getElementById(`f${index}`);
  const candle = document.getElementById(`c${index}`);

  if (flame) {
    flame.classList.add('blown');   // CSS hides the flame
  }

  if (candle) {
    // Create a smoke puff element
    const smoke = document.createElement('div');
    smoke.classList.add('smoke');
    candle.appendChild(smoke);

    // Remove smoke element after animation ends (1.2s)
    setTimeout(() => smoke.remove(), 1400);
  }
}

/**
 * Reset the cake to its original state (called on page revisit).
 */
function resetCake() {
  candlesBlown = false;

  // Restore all flames
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    const flame = document.getElementById(`f${i}`);
    if (flame) flame.classList.remove('blown');
  }

  // Remove all smoke puffs
  document.querySelectorAll('.smoke').forEach(s => s.remove());

  // Reset hint text
  const hint = document.getElementById('cakeHint');
  if (hint) hint.style.opacity = '1';

  // Clear typed message
  const msg = document.getElementById('typedMsg');
  if (msg) msg.textContent = '';

  // Hide final gif
  const gif = document.getElementById('finalGif');
  if (gif) gif.classList.add('hidden');
}


/* ──────────────────────────────────────────────────────
   E. BIRTHDAY MESSAGE TYPEWRITER EFFECT
   ──────────────────────────────────────────────────────
   Types out the birthday message letter by letter.
   🔧 CHANGE: Edit BIRTHDAY_MESSAGE string below
             Adjust TYPE_SPEED for faster/slower typing
   ────────────────────────────────────────────────────── */

// 🔧 CHANGE: This is the message that types out after blow
const BIRTHDAY_MESSAGE = "Wishing you a day full of laughter and joy… Happy Birthday Hamna! 🌸💖🎂";

// 🔧 CHANGE: Milliseconds between each letter (lower = faster)
const TYPE_SPEED = 55;

/**
 * Types BIRTHDAY_MESSAGE letter by letter into #typedMsg element.
 * Shows the final gif after typing completes.
 */
function typeMessage() {
  const msgEl = document.getElementById('typedMsg');
  if (!msgEl) return;

  let i = 0;
  msgEl.textContent = '';   // clear any previous text

  // Set an interval that adds one character at a time
  const typeInterval = setInterval(() => {
    if (i < BIRTHDAY_MESSAGE.length) {
      msgEl.textContent += BIRTHDAY_MESSAGE[i];
      i++;
    } else {
      // Typing complete — stop interval
      clearInterval(typeInterval);

      // Show the celebration gif
      setTimeout(() => {
        const gif = document.getElementById('finalGif');
        if (gif) gif.classList.remove('hidden');
      }, 400);
    }
  }, TYPE_SPEED);
}


/* ──────────────────────────────────────────────────────
   F. INITIALISATION
   ──────────────────────────────────────────────────────
   Runs when the page first loads.
   ────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Activate page 0 (countdown) on load
  const p0 = document.getElementById('page0');
  if (p0) p0.classList.add('active');

  // Spawn initial burst of background hearts
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnHeart, i * 300);
  }

  // Start the live countdown
  startCountdown();

  console.log('🌸 Happy Birthday Hamna! Website loaded ✨');
});


/* ──────────────────────────────────────────────────────
   COUNTDOWN TIMER — PAGE 0
   ──────────────────────────────────────────────────────
   Counts down to Hamna's birthday: May 24 PST
   🔧 CHANGE: Edit BIRTHDAY_DATE string to a different date
              Format: 'YYYY-MM-DDTHH:MM:SS-HH:MM'
              -08:00 = PST, -07:00 = PDT
   ────────────────────────────────────────────────────── */

// 🔧 CHANGE: Set Hamna's birthday date & timezone here
// +05:00 = Pakistan Standard Time (PKT)
const BIRTHDAY_DATE = '2026-05-24T00:00:00+05:00';

function pad2(n) { return String(n).padStart(2, '0'); }

/**
 * Animate the number pop when a digit changes.
 * @param {string} id — element id
 */
function popNum(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('tick-pop');
  void el.offsetWidth;    // force reflow to restart animation
  el.classList.add('tick-pop');
  setTimeout(() => el.classList.remove('tick-pop'), 180);
}

/**
 * Update countdown display every second.
 * Shows birthday message when time runs out.
 */
function tickCountdown() {
  const target = new Date(BIRTHDAY_DATE);
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    // Birthday has arrived!
    document.getElementById('countdownGrid').classList.add('hidden');
    document.getElementById('birthdayArrived').classList.remove('hidden');
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  const updates = [
    ['cdDays',  pad2(days)],
    ['cdHours', pad2(hours)],
    ['cdMins',  pad2(mins)],
    ['cdSecs',  pad2(secs)],
  ];

  for (const [id, val] of updates) {
    const el = document.getElementById(id);
    if (el && el.textContent !== val) {
      el.textContent = val;
      popNum(id);
    }
  }
}

function startCountdown() {
  tickCountdown();                      // run immediately
  setInterval(tickCountdown, 1000);     // then every second
}
