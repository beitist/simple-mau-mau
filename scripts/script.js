const MAU_MAU_VERSION = 'dev 0.05';
const LOG_DETAILS = true;
const DEBUG_GAME_LOGIC = true;

const PATH_TO_CARD_IMAGES = 'img/png/';
const BACK_OF_CARD_IMAGE = 'img/png/red_back.png';

const newGameButton = document.getElementById('button-new-game');
const undoButton = document.getElementById('button-undo');
const topTenButton = document.getElementById('button-top-ten');

const versionElement = document.getElementById('header-version');

const opponentsNode = document.getElementById('opponents');
const playerCardsNode = document.getElementById('player-cards');
const discardPileNode = document.getElementById('discard-pile');
const drawPileNode = document.getElementById('draw-pile');

// totalNumberOfPlayers wird später variabel gesetzt (ab V 1.1)!
let totalNumberOfPlayers = 3;
let cardsPerPlayer = 5;

let gameGoesClockwise = true;

let deckOfCards = {
  cards: [],
  init: function () {
    const CARD_COLORS = ['diamond', 'heart', 'spades', 'club'];
    const CARD_VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const color of CARD_COLORS) {
      for (const cardValue of CARD_VALUES) {
        const card = this.makeCardObject(color, cardValue);
        this.cards.push(card);
        logEntry('Created a card with values ' + color + ' ' + cardValue);
      }
    }
  },
  makeCardObject: function (color, cardValue) {
    let cardScoreValue = 0;
    if (cardValue == 'A') {
      cardScoreValue = 11;
    } else if (cardValue > 6 && cardValue < 11) {
      cardScoreValue = parseInt(cardValue);
    } else {
      cardScoreValue = 10;
    }

    const cardImageFile = cardValue + color[0].toUpperCase() + '.png';
    const cardImageFileAndPath = PATH_TO_CARD_IMAGES + cardImageFile;

    const card = {
      value: cardValue,
      color: color,
      score: cardScoreValue,
      imageSrc: cardImageFileAndPath,
    };
    return card;
  },
};

let discardPile = {
  cards: [],
  renderTopCard: () => {
    if (discardPile.cards.length > 0) {
      const indexOfLastCardAdded = discardPile.cards.length - 1;
      discardPileNode.innerHTML =
        '<img src="' +
        discardPile.cards[indexOfLastCardAdded].imageSrc +
        '" width="100%"></img>';
    } else {
      discardPileNode.innerHTML = '';
    }
  },
};

let drawPile = {
  cards: [],
  renderLastCard: () => {
    if (this.cards.length > 0) {
      drawPileNode.style +=
        'background-image: url("' + BACK_OF_CARD_IMAGE + '")';
    } else {
      drawPileNode.style = '';
    }
  },
  shuffleCards: function shuffleCards() {
    let tempPile = [];
    drawPile.cards.forEach(function (card) {
      tempPile.push(card);
    });
    drawPile.cards = [];
    for (let i = tempPile.length; i > 0; i--) {
      const randomPileIndex = Math.floor(Math.random() * i);
      drawPile.cards.push(tempPile[randomPileIndex]);
      tempPile.splice(randomPileIndex, 1);
    }
    logEntry('Cards shuffled.');
  },
};

class Game {
  constructor() {
    this.table = new Table(totalNumberOfPlayers, cardsPerPlayer);
    this.clockwiseTurns = true;
    this.currentPlayerIndex = 0;
    this.lastPlayerIndex = 0;
    this.nextPlayerIndex = 1;
  }
}

class Player {
  constructor(isHuman) {
    this.isHuman = isHuman;
    this.cards = [];
    this.init = function (isHuman) {
      if (!this.isHuman) {
        opponentsNode.innerHTML += `<div id="player${i}" class="opponent">
      <p id="player${i}-cards" class="opponent-cards"></p>
      <p id="player${i}-name" class="opponent-name">Player ${i}</p>
      </div>`;
      }
    };
  }
}

class Table {
  constructor(totalNumberOfPlayers, cardsPerPlayer) {
    this.availableSeats = totalNumberOfPlayers;
    this.initialCards = cardsPerPlayer;
    this.seats = [];
    this.initPlayers = function () {
      opponentsNode.innerHTML = '';
      playerCardsNode.innerHTML = '';
      for (let i = 0; i < this.availableSeats; i++) {
        let player = new Player(true);
        if (i > 0) {
          player.isHuman = false;
          opponentsNode.innerHTML += `<div id="player${i}" class="opponent">
        <p id="player${i}-cards" class="opponent-cards"></p>
        <p id="player${i}-name" class="opponent-name">Player ${i}</p>
        </div>`;
        }
        this.seats.push(player);
      }
      logEntry('Players generated; in total: ' + this.seats.length);
    };
  }
}

let table = new Table(totalNumberOfPlayers, cardsPerPlayer);

const logEntry = (logText) => {
  if (LOG_DETAILS) {
    console.log(logText);
  }
};

const initStartScreen = () => {
  versionElement.innerText = 'Version: ' + MAU_MAU_VERSION;
  newGameButton.addEventListener('click', startNewGame);
};

const startNewGame = () => {
  logEntry('StartNewGame clicked');
  table.initPlayers();
  deckOfCards.init();
  shiftCardsToDrawPile();
  drawPile.shuffleCards();
  dealOutCards();
  setupGamePiles();
  playTheGame();
};

const shiftCardsToDrawPile = () => {
  if (drawPile.cards.length > 0) {
    drawPile.cards = [];
  }
  drawPile.cards = deckOfCards.cards;
  deckOfCards.cards = [];
};

const dealOutCards = () => {
  drawPile.cards.reverse();
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const player of table.seats) {
      logEntry('Last item in drawPile: ' + drawPile.cards[i].value);
      player.cards.push(drawPile.cards.pop());
      logEntry('Player has ' + player.cards.length + ' cards.');
    }
  }
  drawPile.cards.reverse();
  logEntry('DrawPile now has ' + drawPile.cards.length + ' cards left.');
  renderPlayerCards();
};

const renderPlayerCards = () => {
  for (let i = 0; i < table.length; i++) {
    if (i == 0) {
      table[0].forEach(function (card) {
        playerCardsNode.innerHTML +=
          '<img src="' + card.imageSrc + '" width="50px">';
      });
    } else {
      if (DEBUG_GAME_LOGIC) {
        currentPlayerNode = document.getElementById('player' + i + '-cards');
        table[i].forEach(function (card) {
          currentPlayerNode.innerHTML +=
            '<img src="' + card.imageSrc + '" width="50px">';
        });
      } else {
        currentPlayerNode = document.getElementById('player' + i + '-cards');
        table[i].forEach(function (card) {
          currentPlayerNode.innerHTML +=
            '<img src="' + BACK_OF_CARD_IMAGE + '" width="50px">';
        });
      }
    }
  }
};

const setupGamePiles = () => {};

const playTheGame = () => {
  // loop while nobody is winner ?
};

const drawCardFromStack = (spieler) => {
  // an Spieler austeilen
};

const computerPlays = (computerPlayer) => {
  // Strategie für Spielzug, ausführen
};

const playerPlays = () => {};

initStartScreen();
