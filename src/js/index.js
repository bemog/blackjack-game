const btnPass = document.getElementById("btn-pass");
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");
const btnSettings = document.getElementById("btn-settings");
const cardsPool = document.getElementById("cards-pool");
const resultModal = document.getElementById("game-result");
const startScreen = document.getElementById("start-screen");
const setPlayersNumber = document.getElementById("players-number");
const playersForm = document.getElementById("info-control");

let cardsDeckId,
  activePlayer,
  playersCount = 1,
  gameOn = true,
  players = [],
  lostArray = [],
  passArray = [];

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

// Set player status
const setStatus = (playerIndex, playerStatus, playerMessage) => {
  document
    .getElementById(`cards-${playerIndex}`)
    .parentElement.classList.add(`game__player--${playerStatus}`);
  document.getElementById(
    `status-${playerIndex}`
  ).textContent = `${playerMessage}`;
};

// Croupier's action with delay
const croupierCpuAction = () => {
  if (gameOn) {
    setTimeout(() => {
      if (players[0].score > players[activePlayer].score) {
        pullOneCard(activePlayer);
      } else if (
        players[0].score === players[activePlayer].score &&
        players[0].score > 15
      ) {
        playerPass();
      } else if (
        players[0].score === players[activePlayer].score &&
        players[0].score <= 15
      ) {
        pullOneCard(activePlayer);
      } else {
        playerPass();
      }
    }, 1000);
  }
};

const checkScore = () => {
  // Check if double ace
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
  } else if (players[activePlayer].score > 21) {
    lostArray.push(players[activePlayer]);
    setStatus(activePlayer, "lost", "Defeat");
    setActiveNextPlayer();
  }
  // Check passed scores
  if (lostArray.length + passArray.length === players.length) {
    let duplicate = 0;
    const highestScore = Math.max(...passArray);
    // Check if draw
    passArray.forEach((passedScore) => {
      passedScore === highestScore ? duplicate++ : null;
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
      // Check if biggest score
    } else {
      const highestScorePlayer = players.findIndex((player) => {
        return player.score === highestScore;
      });
      players.forEach((player) => {
        if (player.score !== highestScore) {
          setStatus(player.id, "lost", "Defeat");
        }
      });
      setStatus(highestScorePlayer, "win", "Winner!");
      if (highestScore === 21) {
        gameFinish(players[highestScorePlayer].name, "21 pts - Blackjack!");
      } else {
        gameFinish(players[highestScorePlayer].name, "Highest score!");
      }
    }
    // Check if last man standing
  } else if (lostArray.length === players.length - 1 && players.length > 1) {
    setStatus(activePlayer, "win", "Winner!");
    gameFinish(players[activePlayer].name, "Last man standing!");
  }
  // Check if next player is a casino croupier
  if (
    players[activePlayer].name === "Croupier" &&
    players[activePlayer].cardsNum > 1
  ) {
    croupierCpuAction();
  }
};

// Game finish with winner announce
const gameFinish = (winner, message) => {
  resultModal.classList.add("game__result--show");
  // Direct win message to player in singleplayer mode
  if (winner === "Croupier") {
    resultModal.classList.add("game__result--red");
    resultModal.firstElementChild.innerHTML = `
    You Lost!
    </br>
    </br>
     ${message}
  `;
    // Direct lose message to player in singleplayer mode
  } else if (winner !== null && playersCount === 1) {
    resultModal.firstElementChild.innerHTML = `
    You Won!
    </br>
    </br>
     ${message}
  `;
    // Point the winner
  } else if (winner !== null) {
    resultModal.firstElementChild.innerHTML = `
      The winner is ${winner} 
      </br>
      </br>
       ${message}
    `;
    // Show draw message
  } else {
    resultModal.firstElementChild.textContent = `
     ${message}
    `;
  }
  gameOn = false;
};

const setActiveNextPlayer = () => {
  activePlayer++;
  // Remove class active
  for (i = 0; i < players.length; i++) {
    document
      .getElementById(`cards-${i}`)
      .parentElement.classList.remove("game__player--active");
  }
  // Check if last man standing
  if (lostArray.length === players.length - 1) {
    gameOn = false;
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
      // Update score
      document.getElementById(
        `score-${activePlayer}`
      ).textContent = `Points: ${players[activePlayer].score}/21`;
      // Create new card element
      const newCard = document.createElement("div");
      newCard.className = "game__player-cards-card";
      newCard.innerHTML = `
        <div class="game__player-cards-card-inner">
          <div class="game__player-cards-card-inner-front">
          <img class="game__player-cards-card-inner-front-image"
          src="./src/image/card-pool.png"
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
      `;
      // Add new card to DOM
      document.getElementById(`cards-${activePlayer}`).appendChild(newCard);

      checkScore();
    });
};

// Pull two starting cards
const pullStartCards = () => {
  // Check if player has no cards and game is not finished
  if (players[activePlayer].score === 0 && gameOn) {
    pullOneCard(activePlayer);
    setTimeout(() => {
      pullOneCard(activePlayer);
    }, 800);
  }
};

// Clear UI when restart
const clearUI = () => {
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
    // Hide start screen
    startScreen.classList.add("start-screen--hide");
    // Clear player cards
    const playerInfo = document.getElementById(`cards-${i}`);
    playerInfo.parentElement.className = `game__player game__player-${classNumber}`;

    if (i === 1 && playersCount <= 2) {
      playerInfo.parentElement.classList.add("game__player-two--duel");
    }
    playerInfo.innerHTML = "";
    // Clear player status and points
    document.getElementById(`status-${i}`).textContent = "In game";
    document.getElementById(`score-${i}`).textContent = "Points: 0/21";
    // Hide and clear finish results modal
    const resultModal = document.getElementById("game-result");
    resultModal.classList.remove("game__result--show");
    resultModal.firstElementChild.innerHTML = "";
    // Enable buttons
    btnPass.classList.remove("game__button-pass--disable");
    cardsPool.classList.remove("game__cards-pool--disable");
    // Clear red result modal color
    resultModal.classList.remove("game__result--red");
  }
};

// Update starting screen player name inputs
const updatePlayerInputs = (e) => {
  // Clear container with inputs
  playersForm.innerHTML = "";
  // Create as much player name inputs as sets in number input
  playersCount = +e.target.value;
  // Prevent from set up more than 4 or less than 1 players
  if (playersCount >= 1 && playersCount <= 4) {
    for (i = 0; i < playersCount; i++) {
      playersForm.innerHTML += `
      <label>
      <i class="fas fa-user"></i>
      <input
      class="start-screen__info-control-input"
      type="text"
      name="player${i}-name"
      id="player${i}-name"
      value="Player ${i + 1}"/>
      </label>
      
      `;
    }
  }
};

const startNewGame = async () => {
  players = [];
  lostArray = [];
  passArray = [];
  gameOn = true;

  // Change players positions if there is only 2 players
  if (playersCount <= 2) {
    document
      .getElementById("player-1-position")
      .classList.add("game__player-two--duel");
  }

  // Create new players objects and push them to players table
  for (i = 0; i < playersCount; i++) {
    const name = document.getElementById(`player${i}-name`).value;
    const player = {
      id: i,
      name: `${name}`,
      score: 0,
      cardsNum: 0,
    };
    players.push(player);

    // Add casino croupier player if single player
    if (playersCount === 1) {
      const playerCpu = {
        id: 1,
        name: "Croupier",
        score: 0,
        cardsNum: 0,
      };
      players.push(playerCpu);
      document.getElementById(`player-1-position-name`).textContent =
        "Casino Croupier";
    }

    // Update players names on board
    const playerStation = document.getElementById(`player-${i}-position-name`);
    playerStation.textContent = name;
  }

  clearUI();

  // Set first player active
  activePlayer = 0;
  setStatus(activePlayer, "active", "In game");

  cardsDeckId = await getNewCardsDeck();

  pullStartCards();
};

// Player pass
const playerPass = () => {
  setStatus(activePlayer, "pass", "Passed");
  passArray.push(players[activePlayer].score);
  // Disable buttons if it is cpu croupier turn
  if (playersCount === 1) {
    btnPass.classList.add("game__button-pass--disable");
    cardsPool.classList.add("game__cards-pool--disable");
  }
  checkScore();
  setActiveNextPlayer();
};

// Event listeners
btnPass.addEventListener("click", playerPass);

btnStart.addEventListener("click", () => {
  // Animate start screen and start new game with delay
  const startInfo = document.getElementById("start-screen-info");
  startInfo.classList.add("start-screen__info--grow");
  setTimeout(() => {
    document.getElementById("wrapper").classList.add("wrapper--show");
  }, 1000);
  setTimeout(() => {
    startNewGame();
  }, 1000);
});

btnRestart.addEventListener("click", () => {
  // Hide finish results and start new game
  document.getElementById("game-result").classList.remove("game__result--show");
  startNewGame();
});

btnSettings.addEventListener("click", () => {
  // Show starting screen to change players
  const startInfo = document.getElementById("start-screen-info");
  startInfo.classList.remove("start-screen__info--grow");
  document.getElementById("wrapper").classList.remove("wrapper--show");
  startScreen.classList.remove("start-screen--hide");
  // Hide players stations before insert new players
  const playersStations = document.querySelectorAll(".game__player");
  playersStations.forEach((player) => {
    player.classList.add("game__player--hide");
  });
});

cardsPool.addEventListener("click", () => {
  pullOneCard(activePlayer);
});

setPlayersNumber.addEventListener("change", updatePlayerInputs);
