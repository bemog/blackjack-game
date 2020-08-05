const btnSingle = document.getElementById("btn-singleplayer");
const btnMulti = document.getElementById("btn-multiplayer");
const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");
const cardsPool = document.getElementById("cards-pool");

let cardsDeckId;
let players = [];
let playersLost = 0;
let playersPassed = 0;
let activePlayer;

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
  if (
    players[activePlayer].score === 22 &&
    players[activePlayer].cardsNum === 2
  ) {
    gameFinish(players[activePlayer].name, "Double Ace!");
  } else if (players[activePlayer].score === 21) {
    gameFinish(players[activePlayer].name, "Blackjack!");
  } else if (players[activePlayer].score > 21) {
    players[activePlayer].inGame = false;
    playersLost++;
    document
      .getElementById(`cards-${activePlayer}`)
      .parentElement.classList.add("game__player--lost");
    document.getElementById(`status-${activePlayer}`).textContent = "Defeat";
    setActivePlayer();
  }

  if (playersLost === players.length - 1) {
    const lastPlayer = players.findIndex((player) => {
      return player.passed === true;
    });
    gameFinish(players[lastPlayer].name, "Last man standing!");
  } else if (activePlayer === players.length && playersPassed >= 1) {
    console.log("I must check if anyone passed and compare the scores");
  }
};

// Game finish
const gameFinish = (winner, message) => {
  console.log(`The winner is ${winner}. ${message}`);
  const resultModal = document.getElementById("game-result");
  resultModal.classList.add("game__result--show");
  resultModal.innerHTML = `
    <span class="game__result-text">
       The winner is ${winner}!
       </br>
       ${message}
    </span>
  `;

  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--win");
  document.getElementById(`status-${activePlayer}`).textContent = "Winner!";
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
        <img class="game__player-cards-image" 
          src=${data.cards[0].image} 
          alt="${data.cards[0].suit} 
          ${data.cards[0].value}"
        />`;

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

// Clear UI when restart
const clearDOM = () => {
  for (i = 0; i < players.length; i++) {
    let classNumber;
    switch (i) {
      case 0:
        classNumber = "one";
        break;
      case 1:
        classNumber = "two";
        break;
      case 2:
        classNumber = "three";
        break;
      case 3:
        classNumber = "four";
        break;
    }

    const playerInfo = document.getElementById(`cards-${i}`);
    playerInfo.parentElement.className = `game__player game__player-${classNumber}`;
    playerInfo.innerHTML = "";

    document.getElementById(`status-${i}`).textContent = "In game";
    document.getElementById(`score-${i}`).textContent = "Points: 0/21";

    const resultModal = document.getElementById("game-result");
    resultModal.classList.remove("game__result--show");
    resultModal.innerHTML = "";
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
      passed: false,
    },
    {
      name: "Player 2",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
      passed: false,
    },
    {
      name: "Player 3",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
      passed: false,
    },
    {
      name: "Player 4",
      control: "cpu",
      score: 0,
      cardsNum: 0,
      inGame: true,
      passed: false,
    },
  ];

  playersLost = 0;
  playersPassed = 0;

  // Clear UI before start new game
  clearDOM();

  // Set first player active
  activePlayer = 0;
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--active");

  // Get cards deck number from API
  cardsDeckId = await getNewCardsDeck();

  pullStartCards();
};

// Player pass
const playerPass = () => {
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--pass");
  players[activePlayer].inGame = false;
  players[activePlayer].passed = true;
  document.getElementById(`status-${activePlayer}`).textContent = "Passed";
  playersPassed++;
  setActivePlayer();
};

// Event listeners
btnSingle.addEventListener("click", () => {
  console.log("single");
});

btnMulti.addEventListener("click", () => {
  console.log("multi");
});

btnPass.addEventListener("click", playerPass);

btnStart.addEventListener("click", startNewGame);

btnRestart.addEventListener("click", () => {
  document.getElementById("game-result").classList.remove("game__result--show");
  startNewGame();
});

cardsPool.addEventListener("click", () => {
  pullOneCard(activePlayer);
});
