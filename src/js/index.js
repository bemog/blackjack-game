const btnSingle = document.getElementById("btn-singleplayer");
const btnMulti = document.getElementById("btn-multiplayer");
const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");
const cardsPool = document.getElementById("cards-pool");
const resultModal = document.getElementById("game-result");
const startScreen = document.getElementById("start-screen");

let cardsDeckId;
let activePlayer;
let players = [];
let lostArray = [];
let passArray = [];

// Get new cards deck id from API - DONE
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

// Set player state
const setStatus = (playerIndex, playerStatus, playerMessage) => {
  document
    .getElementById(`cards-${playerIndex}`)
    .parentElement.classList.add(`game__player--${playerStatus}`);
  document.getElementById(
    `status-${playerIndex}`
  ).textContent = `${playerMessage}`;
};

// Check score
const checkScore = () => {
  if (
    players[activePlayer].score === 22 &&
    players[activePlayer].cardsNum === 2
  ) {
    players.forEach((player) => {
      if (player.id !== activePlayer) {
        setStatus(player.id, "lost", "Defeat");
      }
    });
    setStatus(activePlayer, "win", "Winner!");
    gameFinish(players[activePlayer].name, "Double Ace!");
  } else if (players[activePlayer].score === 21) {
    players.forEach((player) => {
      if (player.id !== activePlayer) {
        setStatus(player.id, "lost", "Defeat");
      }
    });
    setStatus(activePlayer, "win", "Winner!");
    gameFinish(players[activePlayer].name, "Blackjack!");
  } else if (players[activePlayer].score > 21) {
    lostArray.push(players[activePlayer]);
    document
      .getElementById(`cards-${activePlayer}`)
      .parentElement.classList.remove("game__player--active");
    setStatus(activePlayer, "lost", "Defeat");

    if (activePlayer < players.length - 1) {
      setActiveNextPlayer();
    }
  }

  if (lostArray.length + passArray.length === players.length) {
    const highestScore = Math.max(...passArray);
    let duplicate = 0;
    passArray.forEach((score) => {
      score === highestScore ? duplicate++ : null;
    });
    if (duplicate > 1) {
      players.forEach((player) => {
        if (player.score < highestScore) {
          setStatus(player.id, "lost", "Defeat");
        } else if (player.score === highestScore) {
          setStatus(player.id, "win", "Draw!");
        }
      });
      gameFinish(null, "It's a draw!");
    } else {
      const highestIndex = players.findIndex((player) => {
        return player.score === highestScore;
      });
      players.forEach((player) => {
        if (player.score !== highestScore) {
          setStatus(player.id, "lost", "Defeat");
        }
      });
      setStatus(highestIndex, "win", "Winner!");
      gameFinish(players[highestIndex].name, "Highest score!");
    }
  } else if (lostArray.length === players.length - 1) {
    setStatus(activePlayer, "win", "Winner!");
    gameFinish(players[activePlayer].name, "Last man standing!");
  }
};

// Game finish
const gameFinish = (winner, message) => {
  resultModal.classList.add("game__result--show");
  if (winner !== null) {
    resultModal.firstElementChild.innerHTML = `
      The winner is ${winner} </br>
       ${message}
    `;
  } else {
    resultModal.firstElementChild.textContent = `
     ${message}
    `;
  }
};

// Set active player
const setActiveNextPlayer = () => {
  activePlayer++;
  // Remove class active
  for (i = 0; i < players.length; i++) {
    document
      .getElementById(`cards-${i}`)
      .parentElement.classList.remove("game__player--active");
  }
  // Check if there is next player and set him active
  if (activePlayer < players.length) {
    setStatus(activePlayer, "active", "In game");
    pullStartCards();
  }
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
      const newCard = document.createElement("div");
      newCard.innerHTML = `
      <div class="game__player-cards-card">
        <div class="game__player-cards-card-inner">
          <div class="game__player-cards-card-inner-front">
          <img class="game__player-cards-card-inner-front-image"
          src="./image/card-pool.png"
          />
          </div>
          <div class="game__player-cards-card-inner-back">
            <img class="game__player-cards-card-inner-back-image" 
              src=${data.cards[0].image} 
              alt="${data.cards[0].suit} 
              ${data.cards[0].value}"
            />
          </div>
        </div>
      </div>
      `;
      document.getElementById(`cards-${activePlayer}`).appendChild(newCard);

      checkScore();
    });
};

// Pull two starting cards
const pullStartCards = () => {
  if (players[activePlayer].score === 0) {
    pullOneCard(activePlayer);

    setTimeout(() => {
      pullOneCard(activePlayer);
    }, 1000);
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

    startScreen.classList.add("start-screen--hide");

    const playerInfo = document.getElementById(`cards-${i}`);
    playerInfo.parentElement.className = `game__player game__player-${classNumber}`;
    playerInfo.innerHTML = "";

    document.getElementById(`status-${i}`).textContent = "In game";
    document.getElementById(`score-${i}`).textContent = "Points: 0/21";

    const resultModal = document.getElementById("game-result");
    resultModal.classList.remove("game__result--show");
    resultModal.firstElementChild.innerHTML = "";
  }
};

// Start new game
const startNewGame = async () => {
  players = [
    {
      id: 0,
      name: "Player 1",
      control: "human",
      score: 0,
      cardsNum: 0,
    },
    {
      id: 1,
      name: "Player 2",
      control: "cpu",
      score: 0,
      cardsNum: 0,
    },
    {
      id: 2,
      name: "Player 3",
      control: "cpu",
      score: 0,
      cardsNum: 0,
    },
    {
      id: 3,
      name: "Player 4",
      control: "cpu",
      score: 0,
      cardsNum: 0,
    },
  ];

  lostArray = [];
  passArray = [];

  // Clear UI before start new game
  clearDOM();

  // Set first player active
  activePlayer = 0;
  setStatus(activePlayer, "active", "In game");

  // Get cards deck number from API
  cardsDeckId = await getNewCardsDeck();

  pullStartCards();
};

// Player pass
const playerPass = () => {
  setStatus(activePlayer, "pass", "Passed");
  passArray.push(players[activePlayer].score);
  checkScore();
  setActiveNextPlayer();
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
