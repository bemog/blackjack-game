const btnSingle = document.getElementById("btn-singleplayer");
const btnMulti = document.getElementById("btn-multiplayer");
const btnGetCard = document.getElementById("btn-get");
const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");

// Get new cards deck id from API
const getNewCardsDeck = async () => {
  let response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  let data = await response.json();
  return data.deck_id;
};

// Start new game
const startNewGame = async () => {
  const cardsDeckId = await getNewCardsDeck();
  console.log(cardsDeckId);
};

// Event listeners
btnSingle.addEventListener("click", () => {
  console.log("single");
});

btnMulti.addEventListener("click", () => {
  console.log("multi");
});

btnGetCard.addEventListener("click", () => {
  console.log("btnGetCard");
});

btnPass.addEventListener("click", () => {
  console.log("btnPass");
});

btnStart.addEventListener("click", startNewGame);
