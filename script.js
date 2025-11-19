import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcX7NYcBH4rVtcP3V9vRt2Aaudupxew_E",
  authDomain: "repogame-9cfd8.firebaseapp.com",
  projectId: "repogame-9cfd8",
  storageBucket: "repogame-9cfd8.firebasestorage.app",
  messagingSenderId: "204877297532",
  appId: "1:204877297532:web:f93942eb5bae603ae2d6f9",
  databaseURL: "https://repogame-9cfd8-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const gameRef = ref(db, "currentSpin");

const inMatchRules = [
"Revive a dead player - LA",
"Break an item - LA",
"Damage an item - LA",
"Hit a player - LA",
"Die - HA",
"Say something mean - LA",
"Kill a player - HA",
"Tip over an animal box - HA",
"Break an orb - HA",
"Call each other the wrong name - LA",
"Light items can only be carried by one person - HA",
"Knock a player with the cart - LA",
"Cause an explosion - HA",
"Slide - LA",
"Jump - LA",
"Swear - LA",
"Receive fall damage - LA",
"Hurt a player - LA",
"Call chat 'chat' - LA",
];

const endMatchRules = [
"Complete a level without killing a monster - LA",
"Complete a level while having been revived  - HA",
"Complete a level having revived a player - HA",
"Complete a level without everyone alive - HA",
"For each item (knowingly) left behind - HA",
];

const inCountInput = document.getElementById("in_game_triggers");
const postCountInput = document.getElementById("post_game_triggers");
const decreaseInBtn = document.getElementById("decrease_in_game_triggers");
const increaseInBtn = document.getElementById("increase_in_game_triggers");
const decreasePostBtn = document.getElementById("decrease_post_game_triggers");
const increasePostBtn = document.getElementById("increase_post_game_triggers");
const inSlotsContainer = document.getElementById("in_slots");
const postSlotsContainer = document.getElementById("post_slots");
const spinButton = document.getElementById("spin");

let currentInSlots = [];
let currentPostSlots = [];

function renderSlots(inCount, postCount) {
  inSlotsContainer.innerHTML = "";
  postSlotsContainer.innerHTML = "";
  currentInSlots = [];
  currentPostSlots = [];

  const containerWidth = document.querySelector(".container").clientWidth;
  const slotWidth = Math.max(200, Math.min(500, containerWidth - 40));

  inSlotsContainer.style.setProperty("--slot-width", `${slotWidth}px`);
  postSlotsContainer.style.setProperty("--slot-width", `${slotWidth}px`);

  for (let i = 0; i < inCount; i++) {
    const el = document.createElement("div");
    el.className = "slot";
    el.textContent = "—";
    inSlotsContainer.appendChild(el);
    currentInSlots.push(el);
  }

  for (let i = 0; i < postCount; i++) {
    const el = document.createElement("div");
    el.className = "slot";
    el.textContent = "—";
    postSlotsContainer.appendChild(el);
    currentPostSlots.push(el);
  }
}

function randomRule(rules) {
  return rules[Math.floor(Math.random() * rules.length)];
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

function getCountFromDiv(el) {
  const val = parseInt(el.textContent || "0", 10) || 0;
  return Math.min(10, Math.max(1, val));
}

function setCountOnDiv(el, v) {
  const v2 = Math.min(10, Math.max(1, v));
  el.textContent = String(v2);
}

function updateButtonsState() {
  const inCount = getCountFromDiv(inCountInput);
  const postCount = getCountFromDiv(postCountInput);
  decreaseInBtn.disabled = inCount <= 1;
  increaseInBtn.disabled = inCount >= 10;
  decreasePostBtn.disabled = postCount <= 1;
  increasePostBtn.disabled = postCount >= 10;
}

function changeCount(divEl, delta) {
  const newVal = Math.min(10, Math.max(1, getCountFromDiv(divEl) + delta));
  setCountOnDiv(divEl, newVal);
  renderSlots(getCountFromDiv(inCountInput), getCountFromDiv(postCountInput));
  updateButtonsState();
  update(gameRef, {
    inCount: getCountFromDiv(inCountInput),
    postCount: getCountFromDiv(postCountInput),
    timestamp: Date.now()
  });
}

decreaseInBtn.addEventListener('click', () => changeCount(inCountInput, -1));
increaseInBtn.addEventListener('click', () => changeCount(inCountInput, 1));
decreasePostBtn.addEventListener('click', () => changeCount(postCountInput, -1));
increasePostBtn.addEventListener('click', () => changeCount(postCountInput, 1));

const SPIN_DURATION = 700;
const REVEAL_DELAY = 400;

spinButton.addEventListener("click", async () => {
  const inCount = getCountFromDiv(inCountInput);
  const postCount = getCountFromDiv(postCountInput);

  renderSlots(inCount, postCount);

  spinButton.disabled = true;

  const selectedIn = pickMany(inMatchRules, inCount);
  const selectedPost = pickMany(endMatchRules, postCount);

  const allSlots = [...currentInSlots, ...currentPostSlots];
  allSlots.forEach(s => s.classList.add("spin"));

  await new Promise(r => setTimeout(r, SPIN_DURATION));

  for (let i = 0; i < allSlots.length; i++) {
    const el = allSlots[i];
    const txt = i < selectedIn.length ? selectedIn[i] : selectedPost[i - selectedIn.length];
    el.classList.remove("spin");
    el.textContent = txt;
    await new Promise(r => setTimeout(r, REVEAL_DELAY));
  }

  await set(gameRef, {
    inMatch: selectedIn,
    postMatch: selectedPost,
    inCount,
    postCount,
    timestamp: Date.now()
  });

  spinButton.disabled = false;
});

onValue(gameRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  const inCount = Math.min(10, Math.max(1, parseInt(data.inCount || 1, 10)));
  const postCount = Math.min(10, Math.max(1, parseInt(data.postCount || 1, 10)));

  inCountInput.textContent = String(inCount);
  postCountInput.textContent = String(postCount);

  renderSlots(inCount, postCount);

  if (data.inMatch) {
    data.inMatch.forEach((txt, i) => {
      if (currentInSlots[i]) currentInSlots[i].textContent = txt;
    });
  }

  if (data.postMatch) {
    data.postMatch.forEach((txt, i) => {
      if (currentPostSlots[i]) currentPostSlots[i].textContent = txt;
    });
  }

  updateButtonsState();
});

renderSlots(getCountFromDiv(inCountInput), getCountFromDiv(postCountInput));
updateButtonsState();