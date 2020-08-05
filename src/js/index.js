const btnSingle = document.getElementById("btn-singleplayer");
const btnMulti = document.getElementById("btn-multiplayer");
const btnGetCard = document.getElementById("btn-get");
const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");
const cardPool = document.getElementById("card-pool");

let cardsDeckId;
let players = [];
let activePlayer = 0;

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

// Check score
const checkScore = () => {
  if (players[activePlayer].score > 21) {
    players[activePlayer].inGame = false;
    document
      .getElementById(`cards-${activePlayer}`)
      .parentElement.classList.add("game__player--lost");
    document.getElementById(`status-${activePlayer}`).textContent = "You lose";
    setActivePlayer();
  } else if (players[activePlayer].score === 21) {
    document
      .getElementById(`cards-${activePlayer}`)
      .parentElement.classList.add("game__player--win");
  }
};

// Game finish
const gameFinish = () => {
  console.log("Game is finished!");
};

// Set active player
const setActivePlayer = () => {
  activePlayer++;

  // Remove class active
  for (i = 0; i < players.length; i++) {
    document
      .getElementById(`cards-${i}`)
      .parentElement.classList.remove("game__player--active");
  }
  // Check if there is next player
  if (activePlayer < players.length) {
    document
      .getElementById(`cards-${activePlayer}`)
      .parentElement.classList.add("game__player--active");
  } else {
    gameFinish();
    return;
  }

  pullStartCards();
};

// Pull one card from deck
const pullOneCard = async () => {
  fetch(`https://deckofcardsapi.com/api/deck/${cardsDeckId}/draw/?count=1`)
    .then((response) => response.json())
    .then((data) => {
      // Set points value for specific cards
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
      // Update player score and cards number
      players[activePlayer].score += points;
      players[activePlayer].cardsNum++;
      // Update player panel DOM
      document.getElementById(
        `score-${activePlayer}`
      ).textContent = `Points: ${players[activePlayer].score}/21`;
      document.getElementById(`cards-${activePlayer}`).innerHTML += `
        <img class="game__player-cards-image" src=${data.cards[0].image} alt="${data.cards[0].suit} ${data.cards[0].value}"/>`;

      checkScore();
    });
};

// Pull two starting cards
const pullStartCards = () => {
  if (players[activePlayer].score === 0) {
    pullOneCard(activePlayer);
    pullOneCard(activePlayer);
  }
};

// Start new game
const startNewGame = async () => {
  players = [
    {
      name: "Player 1",
      control: "human",
      score: 0,
      cardsNum: 0,
      inGame: true,
    },
    {
      name: "Player 2",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
    },
    {
      name: "Player 3",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
    },
    {
      name: "Player 4",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
    },
  ];

  // Get cards deck number from API
  cardsDeckId = await getNewCardsDeck();

  // Set first player class active
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--active");

  pullStartCards();
};

// Event listeners
btnSingle.addEventListener("click", () => {
  console.log("single");
});

btnMulti.addEventListener("click", () => {
  console.log("multi");
});

btnGetCard.addEventListener("click", () => {
  pullOneCard(activePlayer);
});

btnPass.addEventListener("click", () => {
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--pass");
  players[activePlayer].inGame = false;
  document.getElementById(`status-${activePlayer}`).textContent = "Passed";
  setActivePlayer();
});

btnStart.addEventListener("click", startNewGame);

cardPool.addEventListener("click", () => {
  pullOneCard(activePlayer);
});
