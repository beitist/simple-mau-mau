const MAU_MAU_VERSION = 'dev 0.10';
const LOG_DETAILS = true;
const DEBUG_GAME_LOGIC = true;

const PATH_TO_CARD_IMAGES = 'img/png/';
const BACK_OF_CARD_IMAGE = 'img/png/red_back.png';

const newGameButton = document.getElementById('button-new-game');
const undoButton = document.getElementById('button-undo');
const topTenButton = document.getElementById('button-top-ten');

const versionElement = document.getElementById('header-version');

const opponentsNode = document.getElementById('opponents');
const discardPileNode = document.getElementById('discard-pile');
const drawPileNode = document.getElementById('draw-pile');

// totalNumberOfPlayers wird später variabel gesetzt (ab V 1.1)!
let totalNumberOfPlayers = 3;
let cardsPerPlayer = 5;

let gameGoesClockwise = true;
let game = '';

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
        uniqueID: cardValue + color[0].toUpperCase(),
      };
      return card;
    };
  }
}

class DiscardPile {
  constructor() {
    this.cards = [];
    this.receiveCard = function(card) {
      this.cards.push(card);
      discardPileNode.innerHTML = `<img src="${card.imageSrc}" width="100%" id="${card.uniqueID}"></img>`;
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
          logEntry('Player ID ' + player.playerID + ' has ' + player.cards.length + ' cards.');
        }
      }
      this.table.drawPile.cards.reverse();
      logEntry('DrawPile now has ' + this.table.drawPile.cards.length + ' cards left.');
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
    this.cardsNode = '';
    this.cards = [];
    this.receiveCard = function(receivedCard) {
      this.cards.push(receivedCard);
      this.cardsNode.innerHTML = '';
      if (this.isHuman) {
        for (let i = 0; i < this.cards.length; i++) {
          logEntry('Human rendering, for-block iteration #' + i);
          this.cardsNode.innerHTML += `<img src="${this.cards[i].imageSrc}" width="60px" id="${this.cards[i].uniqueID}"></img>`;
        };
        logEntry('Rendering human player cards');
      } else {
        if (DEBUG_GAME_LOGIC) {
          for (let i = 0; i < this.cards.length; i++) {
            logEntry('PlayerID ' + this.playerID + ' for-block render iteration #' + i);
            logEntry(`Player Object Info:
            ID: ${this.playerID}
            cardsNode: ${this.cardsNode.toString()}
            received card: ${receivedCard.uniqueID}
            outerHTML: ${this.cardsNode.outerHTML}
            HTML to add: <img src="${this.cards[i].imageSrc}">`);
            this.cardsNode.innerHTML += `<img src="${this.cards[i].imageSrc}" width="60px" id="${this.cards[i].uniqueID}"></img>`;
          };
          logEntry('PlayerID ' + this.playerID + ' now has ' + this.cards.length + ' cards. DEBUG MODE ON');
        } else {
          for (let i = 0; i < this.cards.length; i++) {
            this.cardsNode.innerHTML += `<img src="${BACK_OF_CARD_IMAGE}" width="60px" id="${this.cards[i].uniqueID}"></img>`;
          };
          logEntry('PlayerID ' + this.playerID + ' now has ' + this.cards.length + ' cards. DEBUG MODE OFF');
        }
      };
      logEntry('Card received, node updated.');
    };
  };
};

class Table {
  constructor(totalNumberOfPlayers, cardsPerPlayer) {
    this.availableSeats = totalNumberOfPlayers;
    this.initialCards = cardsPerPlayer;
    this.seats = [];
    this.initPlayers = function () {
      opponentsNode.innerHTML = '';
      for (let i = 0; i < this.availableSeats; i++) {
        let player = new Player(true, i);
        // player.init(player.playerID);
        if (i == 0) {
          player.cardsNode = document.getElementById('player-cards');
        } else {
          player.isHuman = false;
          const opponentDivOuter = document.createElement('div');
          opponentDivOuter.classList.add('opponent');
          opponentDivOuter.id = 'player' + i;
          opponentsNode.appendChild(opponentDivOuter);

          const opponentCardsDiv = document.createElement('p');
          opponentCardsDiv.classList.add('opponent-cards');
          opponentCardsDiv.id = 'player' + i + '-cards';
          opponentDivOuter.appendChild(opponentCardsDiv);

          const opponentName = document.createElement('p');
          opponentName.classList.add('opponent-name');
          opponentName.id = 'player' + i + '-name';
          opponentName.innerText = 'Player' + i;
          opponentDivOuter.appendChild(opponentName);

          const playerCardNodeID = 'player' + i + '-cards';
          player.cardsNode = document.getElementById(playerCardNodeID);
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
  game = new Game();
  game.table.initPlayers();
  game.deckOfCards.init();
  game.shiftCardsToDrawPile();
  game.table.drawPile.shuffleCards();
  game.dealOutCards();
};

const shiftCardsToDrawPile = () => {
  if (drawPile.cards.length > 0) {
    drawPile.cards = [];
  }
  drawPile.cards = deckOfCards.cards;
  deckOfCards.cards = [];
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
