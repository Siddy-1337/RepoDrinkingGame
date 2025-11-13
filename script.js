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

const spinButton = document.getElementById("spin");
const slots = [
  document.getElementById("slot1"),
  document.getElementById("slot2"),
  document.getElementById("slot3"),
  document.getElementById("slot4")
];

const STORAGE_KEY = 'repoDrinkingGame.latestSpin';

function saveSpinToStorage(inMatchArr, endMatchStr) {
  const payload = {
    inMatch: inMatchArr,
    endMatch: endMatchStr,
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
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;
    if (Array.isArray(data.inMatch)) {
      for (let i = 0; i < 3; i++) {
        if (data.inMatch[i]) slots[i].textContent = data.inMatch[i];
      }
    }
    if (data.endMatch) slots[3].textContent = data.endMatch;
  } catch (e) {
    console.warn('Could not load saved spin', e);
  }
}

// baby function to pick a random rule
function randomRule(rules) {
  return rules[Math.floor(Math.random() * rules.length)];
}

spinButton.addEventListener("click", () => {
  // spin animation
  slots.forEach(slot => slot.classList.add("spin"));

  setTimeout(() => {
    // Pick 3 in-match + 1 end-match - to be updated to make dynamic later
    const selectedInMatch = [];
    while (selectedInMatch.length < 3) {
      const pick = randomRule(inMatchRules);
      if (!selectedInMatch.includes(pick)) selectedInMatch.push(pick);
    }

    const selectedEnd = randomRule(endMatchRules);

    // Update the display
    for (let i = 0; i < 3; i++) {
      slots[i].textContent = selectedInMatch[i];
    }
    slots[3].textContent = selectedEnd;

    // Persist the chosen rules so other clients (or reloads) can see them
    saveSpinToStorage(selectedInMatch, selectedEnd);

    // Remove spin effect
    slots.forEach(slot => slot.classList.remove("spin"));
  }, 700);
});

// Load any previously saved spin on page load
loadSavedSpin();