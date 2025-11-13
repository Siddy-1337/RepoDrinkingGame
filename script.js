//
const inMatchRules = [
  "Revive a player – LA",
  "Break an item – LA",
  "Hit a player – LA",
  "Die – HA",
  "Kill a player – HA",
  "Tip over animal box – HA",
  "Break an orb – HA"
];

const endMatchRules = [
  "Complete a level without killing a monster – LA",
  "Complete a level while having been revived – HA",
  "Complete a level without everyone alive – HA",
  "Loser of Losers – HA",
  "Winner of Losers – LA",
  "Call each other by the wrong name – LA"
];

const inCountInput = document.getElementById('in_game_triggers');
const postCountInput = document.getElementById('post_game_triggers');
const inSlotsContainer = document.getElementById('in_slots');
const postSlotsContainer = document.getElementById('post_slots');
const spinButton = document.getElementById('spin');

const STORAGE_KEY = 'repoDrinkingGame.latestSpin';

let currentInSlots = [];
let currentPostSlots = [];

function saveSpinToStorage(inMatchArr, postMatchArr) {
  const payload = {
    inMatch: inMatchArr,
    postMatch: postMatchArr,
    ts: Date.now()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not save spin to localStorage', e);
  }
}

function loadSavedSpin() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // no saved spin — render based on inputs
      renderSlots(parseInt(inCountInput.value || '3', 10), parseInt(postCountInput.value || '1', 10));
      return;
    }
    const data = JSON.parse(raw);
    if (!data) return;

    // If we have saved arrays, render slots to match their lengths and populate
    const inCount = Array.isArray(data.inMatch) ? data.inMatch.length : parseInt(inCountInput.value || '3', 10);
    const postCount = Array.isArray(data.postMatch) ? data.postMatch.length : parseInt(postCountInput.value || '1', 10);

    // update inputs to reflect saved counts
    inCountInput.value = inCount;
    postCountInput.value = postCount;

    renderSlots(inCount, postCount);

    if (Array.isArray(data.inMatch)) {
      for (let i = 0; i < data.inMatch.length && i < currentInSlots.length; i++) {
        currentInSlots[i].textContent = data.inMatch[i];
      }
    }
    if (Array.isArray(data.postMatch)) {
      for (let i = 0; i < data.postMatch.length && i < currentPostSlots.length; i++) {
        currentPostSlots[i].textContent = data.postMatch[i];
      }
    }
  } catch (e) {
    console.warn('Could not load saved spin', e);
    renderSlots(parseInt(inCountInput.value || '3', 10), parseInt(postCountInput.value || '1', 10));
  }
}

function randomRule(rules) {
  return rules[Math.floor(Math.random() * rules.length)];
}

function renderSlots(inCount, postCount) {
  inCount = Math.max(0, parseInt(inCount || 0, 10));
  postCount = Math.max(0, parseInt(postCount || 0, 10));

  // compute a reasonable slot width based on the current container width
  const containerEl = document.querySelector('.container');
  const containerMax = containerEl ? containerEl.clientWidth : 700;
  // Since slots are stacked vertically, width doesn't need to shrink with count.
  // Use container width minus some padding, constrain to a reasonable range.
  const calculated = Math.floor(containerMax - 40);
  const widthPx = Math.max(200, Math.min(640, calculated)); // keep widths readable

  inSlotsContainer.innerHTML = '';
  postSlotsContainer.innerHTML = '';

  inSlotsContainer.style.setProperty('--slot-width', widthPx + 'px');
  postSlotsContainer.style.setProperty('--slot-width', widthPx + 'px');

  currentInSlots = [];
  currentPostSlots = [];

  for (let i = 0; i < inCount; i++) {
    const d = document.createElement('div');
    d.className = 'slot';
    d.id = `slot-in-${i+1}`;
    d.textContent = '—';
    inSlotsContainer.appendChild(d);
    currentInSlots.push(d);
  }

  for (let i = 0; i < postCount; i++) {
    const d = document.createElement('div');
    d.className = 'slot wide';
    d.id = `slot-post-${i+1}`;
    d.textContent = '—';
    postSlotsContainer.appendChild(d);
    currentPostSlots.push(d);
  }
}

function pickMany(rules, count) {
  const picks = [];
  const allowDup = count > rules.length;
  while (picks.length < count) {
    const pick = randomRule(rules);
    if (allowDup || !picks.includes(pick)) picks.push(pick);
  }
  return picks;
}

spinButton.addEventListener('click', () => {
  const inCount = Math.max(0, parseInt(inCountInput.value || '0', 10));
  const postCount = Math.max(0, parseInt(postCountInput.value || '0', 10));

  // ensure slots exist for current counts
  renderSlots(inCount, postCount);

  const allSlots = [...currentInSlots, ...currentPostSlots];
  allSlots.forEach(s => s.classList.add('spin'));

  setTimeout(() => {
    const selectedIn = pickMany(inMatchRules, inCount);
    const selectedPost = pickMany(endMatchRules, postCount);

    for (let i = 0; i < currentInSlots.length; i++) {
      currentInSlots[i].textContent = selectedIn[i] || '—';
    }
    for (let i = 0; i < currentPostSlots.length; i++) {
      currentPostSlots[i].textContent = selectedPost[i] || '—';
    }

    saveSpinToStorage(selectedIn, selectedPost);

    allSlots.forEach(s => s.classList.remove('spin'));
  }, 700);
});

// re-render when inputs change
inCountInput.addEventListener('change', () => {
  const v = parseInt(inCountInput.value || '0', 10) || 0;
  renderSlots(v, parseInt(postCountInput.value || '0', 10) || 0);
});
postCountInput.addEventListener('change', () => {
  const v = parseInt(postCountInput.value || '0', 10) || 0;
  renderSlots(parseInt(inCountInput.value || '0', 10) || 0, v);
});

// initialize
if (!inCountInput.value) inCountInput.value = '3';
if (!postCountInput.value) postCountInput.value = '1';
loadSavedSpin();