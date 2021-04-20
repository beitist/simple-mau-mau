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

class CardRenderer {
  constructor() {
    this.updateNodes = function(from) {
      if (from == 'drawPile') {}
    };
  }
}

class DeckOfCards {
  constructor() {
    this.cards = [];
    this.init = function () {
      const CARD_COLORS = ['diamond', 'heart', 'spades', 'club'];
      const CARD_VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      for (const color of CARD_COLORS) {
        for (const cardValue of CARD_VALUES) {
          const card = this.makeCardObject(color, cardValue);
          this.cards.push(card);
          logEntry('Created a card with values ' + color + ' ' + cardValue);
        }
      }
    };
    this.makeCardObject = function (color, cardValue) {
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
    };
  }
}

class DiscardPile {
  constructor() {
    this.cards = [];
    this.renderTopCard = function () {
      if (this.cards.length > 0) {
        const indexOfLastCardAdded = this.cards.length - 1;
        discardPileNode.innerHTML =
          '<img src="' +
          discardPile.cards[indexOfLastCardAdded].imageSrc +
          '" width="100%"></img>';
      } else {
        discardPileNode.innerHTML = '';
      };
    };
    this.receiveCard = function(card) {
      this.cards.push(card);
      discardPileNode.innerHTML = '<img src="' + card.imageSrc + '" width="100%"></img>';
    };
  };
};

class DrawPile {
  constructor() {
    this.cards = [];
    this.renderLastCard = function () {
      if (this.cards.length > 0) {
        drawPileNode.style +=
          'background-image: url("' + BACK_OF_CARD_IMAGE + '")';
      } else {
        drawPileNode.style = '';
      }
    };
    this.shuffleCards = function () {
      logEntry('Shuffling started.');
      let tempPile = [];
      this.cards.forEach(function (card) {
        tempPile.push(card);
      });
      this.cards = [];
      for (let i = tempPile.length; i > 0; i--) {
        const randomPileIndex = Math.floor(Math.random() * i);
        this.cards.push(tempPile[randomPileIndex]);
        tempPile.splice(randomPileIndex, 1);
      }
      logEntry('Cards shuffled.');
    };
  };
};

class Game {
  constructor() {
    this.table = new Table(totalNumberOfPlayers, cardsPerPlayer);
    this.clockwiseTurns = true;
    this.currentPlayerIndex = 0;
    this.lastPlayerIndex = 0;
    this.nextPlayerIndex = 1;
    this.deckOfCards = new DeckOfCards();
    this.shiftCardsToDrawPile = () => {
      if (this.table.drawPile.cards.length > 0) {
        this.table.drawPile.cards = [];
      }
      this.table.drawPile.cards = this.deckOfCards.cards;
      this.deckOfCards.cards = [];
    };
    this.dealOutCards = () => {
      this.table.drawPile.cards.reverse();
      for (let i = 0; i < this.table.initialCards; i++) {
        for (const player of this.table.seats) {
          logEntry('Last item in drawPile: ' + this.table.drawPile.cards[i].value);
          player.receiveCard(this.table.drawPile.cards.pop());
          logEntry('Player has ' + player.cards.length + ' cards.');
        }
      }
      this.table.drawPile.cards.reverse();
      logEntry('DrawPile now has ' + this.table.drawPile.cards.length + ' cards left.');
      renderPlayerCards();
    };
    this.startTheGame = function() {
      if (this.drawPile.length > 0) {
        this.discardPile.receiveCard(this.drawPile.shift());
      } else {
        // DiscardPile außer oberster Karte neu mischen
      };
    };
  }
}

class Player {
  constructor(isHuman, playerID) {
    this.isHuman = isHuman;
    this.playerID = parseInt(playerID);
    this.cardsNodeInnerHTML = '';
    this.cards = [];
    this.receiveCard = function(receivedCard) {
      this.cards.push(receivedCard);
      this.updateNode();
    };
    this.init = function (isHuman) {
      if (!this.isHuman) {
        opponentsNode.innerHTML += `<div id="player${i}" class="opponent">
      <p id="player${i}-cards" class="opponent-cards"></p>
      <p id="player${i}-name" class="opponent-name">Player ${i}</p>
      </div>`;
      }
    };
    this.updateNode = function() {
      
      logEntry('Cards received, Node not yet updated.');
    };
    this.cardRenderer = new CardRenderer();
  };
};

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
        };
        this.seats.push(player);
      };
      logEntry('Players generated; in total: ' + this.seats.length);
    };
    this.drawPile = new DrawPile();
    this.discardPile = new DiscardPile();
  };
};

const logEntry = (logText) => {
  if (LOG_DETAILS) {
    console.log(logText);
  };
};

const initStartScreen = () => {
  versionElement.innerText = 'Version: ' + MAU_MAU_VERSION;
  newGameButton.addEventListener('click', startNewGame);
};

const startNewGame = () => {
  logEntry('StartNewGame clicked');
  let game = new Game();
  game.table.initPlayers();
  game.deckOfCards.init();
  game.shiftCardsToDrawPile();
  game.table.drawPile.shuffleCards();
  game.dealOutCards();
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
