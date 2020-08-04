const btnSingle = document.getElementById("btn-singleplayer");
const btnMulti = document.getElementById("btn-multiplayer");
const btnGetCard = document.getElementById("btn-get");
const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");
const cardPool = document.getElementById("card-pool");
const score0 = document.getElementById("score-0");
const score1 = document.getElementById("score-1");
const score2 = document.getElementById("score-2");
const score3 = document.getElementById("score-3");
const cards0 = document.getElementById("cards-0");
const cards1 = document.getElementById("cards-1");
const cards2 = document.getElementById("cards-2");
const cards3 = document.getElementById("cards-3");

let scores, activePlayer, gamePlaying, cardsDeckId;

// Get new cards deck id from API
const getNewCardsDeck = async () => {
  let cardsDeckId = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  )
    .then((response) => response.json())
    .then((data) => {
      return data.deck_id;
    });

  return cardsDeckId;
};

// Pull one card from deck
const pullOneCard = async (player) => {
  fetch(`https://deckofcardsapi.com/api/deck/${cardsDeckId}/draw/?count=1`)
    .then((response) => response.json())
    .then((data) => {
      let points = data.cards[0].value;
      switch (points) {
        case "ACE":
          points = 11;
          break;
        case "KING":
          points = 4;
          break;
        case "QUEEN":
          points = 3;
          break;
        case "JACK":
          points = 2;
          break;
        default:
          points = parseInt(data.cards[0].value);
      }
      // Update player score
      scores[player] += points;
      // Update player panel DOM
      document.getElementById(`score-${player}`).textContent = scores[player];
      document.getElementById(`cards-${player}`).innerHTML += `
        <img class="game__player-cards-image" src=${data.cards[0].image} alt="${data.cards[0].suit} ${data.cards[0].value}"/>`;
    });
};

// Pull two starting cards for every player
const pullTwoCards = () => {
  for (i = 0; i < players.length; i++) {
    pullOneCard(i);
  }
};

// Start new game
const startNewGame = async () => {
  players = ["human", "cpu", "cpu", "cpu"];
  scores = [0, 0, 0, 0];
  activePlayer = 0;
  gamePlaying = true;
  cardsDeckId = await getNewCardsDeck();

  pullTwoCards();
  pullTwoCards();
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

cardPool.addEventListener("click", () => {
  console.log("card-pool");
});
