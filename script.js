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

// helper to pick a random rule
function randomRule(rules) {
  return rules[Math.floor(Math.random() * rules.length)];
}

spinButton.addEventListener("click", () => {
  // Add spin animation
  slots.forEach(slot => slot.classList.add("spin"));

  setTimeout(() => {
    // Pick 3 in-match + 1 end-match
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

    // Remove spin effect
    slots.forEach(slot => slot.classList.remove("spin"));
  }, 700);
});