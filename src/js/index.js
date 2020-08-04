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
  players.forEach((player, index) => {
    if (player.score > 21) {
      player.inGame = false;
      document
        .getElementById(`cards-${index}`)
        .parentElement.classList.add("game__player--lost");
    } else if (player.score === 21) {
      document
        .getElementById(`cards-${index}`)
        .parentElement.classList.add("game__player--win");
    }
  });
};

// Set active player
const setActivePlayer = () => {
  activePlayer++;
  if (activePlayer === players.length) {
    activePlayer = 0;
  }
  if (!players[activePlayer].inGame) {
    do activePlayer++;
    while (!players[activePlayer].inGame);
  }

  // Set class active
  players.forEach((item, index) => {
    document
      .getElementById(`cards-${index}`)
      .parentElement.classList.remove("game__player--active");
  });
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--active");

  console.log(activePlayer);
};

// Pull one card from deck
const pullOneCard = async (id) => {
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
      const index = players.findIndex((player) => player.id === id);
      players[index].score += points;
      // Update player panel DOM
      document.getElementById(`score-${id}`).textContent = players[index].score;
      document.getElementById(`cards-${id}`).innerHTML += `
        <img class="game__player-cards-image" src=${data.cards[0].image} alt="${data.cards[0].suit} ${data.cards[0].value}"/>`;

      checkScore();
      setActivePlayer();
    });
};

// Pull two starting cards for every player
const pullStartCards = () => {
  players.forEach((player) => {
    pullOneCard(player.id);
  });
};

// Start new game
const startNewGame = async () => {
  players = [
    {
      id: 0,
      name: "Player 1",
      control: "human",
      score: 0,
      inGame: true,
      pass: false,
    },
    {
      id: 1,
      name: "Player 2",
      control: "cpu",
      score: 0,
      inGame: true,
      pass: false,
    },
    {
      id: 2,
      name: "Player 3",
      control: "cpu",
      score: 0,
      inGame: true,
      pass: false,
    },
    {
      id: 3,
      name: "Player 4",
      control: "cpu",
      score: 0,
      inGame: true,
      pass: false,
    },
  ];

  cardsDeckId = await getNewCardsDeck();

  pullStartCards();
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
  players[activePlayer].pass = true;
  document
    .getElementById(`cards-${activePlayer}`)
    .parentElement.classList.add("game__player--pass");
  players[activePlayer].inGame = false;
  setActivePlayer();
});

btnStart.addEventListener("click", startNewGame);

cardPool.addEventListener("click", () => {
  pullOneCard(activePlayer);
});
