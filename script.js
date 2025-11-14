// --- IMPORT FIREBASE MODULES ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAcX7NYcBH4rVtcP3V9vRt2Aaudupxew_E",
  authDomain: "repogame-9cfd8.firebaseapp.com",
  projectId: "repogame-9cfd8",
  storageBucket: "repogame-9cfd8.firebasestorage.app",
  messagingSenderId: "204877297532",
  appId: "1:204877297532:web:f93942eb5bae603ae2d6f9",
  databaseURL: "https://repogame-9cfd8-default-rtdb.europe-west1.firebasedatabase.app"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const gameRef = ref(db, "currentSpin"); // GLOBAL shared game state

// Rules (to be updated)
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

// element references
const inCountInput = document.getElementById("in_game_triggers");
const postCountInput = document.getElementById("post_game_triggers");
const inSlotsContainer = document.getElementById("in_slots");
const postSlotsContainer = document.getElementById("post_slots");
const spinButton = document.getElementById("spin");

let currentInSlots = [];
let currentPostSlots = [];

// render slot function
function renderSlots(inCount, postCount) {
  inSlotsContainer.innerHTML = "";
  postSlotsContainer.innerHTML = "";

  currentInSlots = [];
  currentPostSlots = [];

  const containerWidth = document.querySelector(".container").clientWidth;
  const slotWidth = Math.max(200, Math.min(640, containerWidth - 40));

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

// helper functions
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

const SPIN_DURATION = 700;
const REVEAL_DELAY = 400;

// spin button
spinButton.addEventListener("click", async () => {
  const inCount = parseInt(inCountInput.value);
  const postCount = parseInt(postCountInput.value);

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

  // sync to firebase
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


  inCountInput.value = data.inCount;
  postCountInput.value = data.postCount;

  renderSlots(data.inCount, data.postCount);

  data.inMatch?.forEach((txt, i) => {
    currentInSlots[i].textContent = txt;
  });

  data.postMatch?.forEach((txt, i) => {
    currentPostSlots[i].textContent = txt;
  });
});


renderSlots(3, 1);
