const MAU_MAU_VERSION = 'dev 0.03';
const LOG_DETAILS = true;
const LOG_DEPTH = 3;
const SHOW_ALL_CARDS = false;
const TURN_OFF_COMPUTER_PLAYING = false;
const CSS_NOT_DONE_YET = true;

const PATH_TO_CARD_IMAGES = 'img/png/';
const BACK_OF_CARD_IMAGE_SRC = 'img/png/red_back.png';
let BACK_OF_CARD_IMG_NODE = document.createElement('img');
BACK_OF_CARD_IMG_NODE.src = BACK_OF_CARD_IMAGE_SRC;
BACK_OF_CARD_IMG_NODE.classList.add = 'card';

const newGameButton = document.getElementById('button-new-game');
const undoButton = document.getElementById('button-undo');
const topTenButton = document.getElementById('button-top-ten');

const versionElement = document.getElementById('header-version');

const opponentsNode = document.getElementById('opponents');
const discardPileNode = document.getElementById('discard-pile');

// totalNumberOfPlayers wird später variabel gesetzt (ab V 1.1)!
let totalNumberOfPlayers = 3;
let cardsPerPlayer = 5;

let gameGoesClockwise = true;
let game = '';

class Game {
  constructor() {
    this.table = new Table(totalNumberOfPlayers, cardsPerPlayer);
    this.clockwiseTurns = true;
    this.currentPlayerIndex = 0;
    this.lastPlayerIndex = 2;
    this.nextPlayerIndex = 1;
    this.deckOfCards = new DeckOfCards();

    this.lastMove = {
      from: '',
      to: '',
      card: '',
    };

    this.setLastMove = function (from, to, card) {
      this.lastMove.from = from;
      this.lastMove.to = to;
      this.lastMove.card = card;
    };

    this.shiftCardsToDrawDeck = () => {
      if (this.table.drawDeck.cards.length > 0) {
        this.table.drawDeck.cards = [];
      }
      for (const card of this.deckOfCards.cards) {
        this.table.drawDeck.receiveCard(card);
      }
      this.deckOfCards.cards = [];
    };

    this.dealOutCards = () => {
      this.table.drawDeck.cards.reverse();
      for (let i = 0; i < this.table.initialCards; i++) {
        for (const player of this.table.seats) {
          let card = this.table.drawDeck.cards.pop();
          player.receiveCard(card);
          game.setLastMove('drawdeck', player.playerId, card.uniqueID);
          logEntry(
            'Player ID ' +
              player.playerId +
              ' has ' +
              player.cards.length +
              ' cards.',
            2
          );
        }
      }
      this.table.discardPile.receiveCard(this.table.drawDeck.cards.pop());
      this.table.drawDeck.cards.reverse();
      logEntry(
        'DrawDeck now has ' + this.table.drawDeck.cards.length + ' cards left.',
        2
      );
    };

    this.startTheGame = function () {
      if (this.drawDeck.length > 0) {
        this.discardPile.receiveCard(this.drawDeck.shift());
      } else {
        // DiscardPile außer oberster Karte neu mischen
      }
    };

    this.checkIfCardCanBePlayed = function (card) {
      let cardOnTop = game.discardPile.returnCardOnTop();
      logEntry('Checking if move is ok; cardOnTop is: ' + cardOnTop.uniqueID + '; argument card.uniqueId = ' + card.uniqueID);
      if (cardOnTop.color == card.color || cardOnTop.value == card.value || card.value == 'J') {
        return true;
      } else { return false;}
    };
  }
}

class Table {
  constructor(totalNumberOfPlayers, cardsPerPlayer) {
    this.availableSeats = totalNumberOfPlayers;
    this.initialCards = cardsPerPlayer;
    this.seats = [];

    opponentsNode.innerHTML = '';
    for (let i = 0; i < this.availableSeats; i++) {
      let player = new Player(true, i);
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

        player.cardsNode = opponentCardsDiv;
      }
      this.seats.push(player);
    }
    logEntry('Players generated; in total: ' + this.seats.length, 1);

    this.drawDeck = new DrawDeck();
    this.discardPile = new DiscardPile();
  }
}

class DeckOfCards {
  constructor() {
    this.cards = [];

    const CARD_COLORS = ['diamond', 'heart', 'spades', 'club'];
    const CARD_VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const color of CARD_COLORS) {
      for (const cardValue of CARD_VALUES) {
        const card = new Card(color, cardValue);
        this.cards.push(card);
        logEntry('Created a card with values ' + color + ' ' + cardValue, 2);
      }
    }
  }
}

class Card {
  constructor(color, cardValue) {
    this.value = cardValue;
    this.color = color;
    this.currentOwner = 'deck';

    let cardScoreValue = 0;
    if (cardValue == 'A') {
      cardScoreValue = 11;
    } else if (cardValue > 6 && cardValue < 11) {
      cardScoreValue = parseInt(cardValue);
    } else {
      cardScoreValue = 10;
    }
    this.score = cardScoreValue;

    this.imageSrc =
      PATH_TO_CARD_IMAGES + cardValue + color[0].toUpperCase() + '.png';
    this.uniqueID = cardValue + color[0].toUpperCase();

    let imageNode = document.createElement('img');
    imageNode.src =
      PATH_TO_CARD_IMAGES + cardValue + color[0].toUpperCase() + '.png';
    imageNode.width = '60';
    imageNode.classList.add('card');
    imageNode.id = cardValue + color[0].toUpperCase();

    let backImageNode = document.createElement('img');
    backImageNode.src = BACK_OF_CARD_IMAGE_SRC;
    backImageNode.classList.add('card');
    backImageNode.id = cardValue + color[0].toUpperCase();

    this.cardImageNode = imageNode;
    this.backImageNode = backImageNode;
  }
}

class DiscardPile {
  constructor() {
    this.cards = [];

    this.receiveCard = function (card) {
      this.cards.push(card);
      card.currentOwner = 'discardPile';
      discardPileNode.innerHTML = '';
      discardPileNode.appendChild(card.cardImageNode);
    };

    this.returnCardOnTop = function () {
      return this.cards[this.cards.length - 1];
    }
  }
}

class DrawDeck {
  constructor() {
    this.cards = [];
    this.drawDeckCardImageNode = document.getElementById('draw-deck');

    this.renderLastCard = function () {
      if (this.cards.length > 0) {
        this.drawDeckCardImageNode.appendChild(BACK_OF_CARD_IMG_NODE);
      } else {
        this.drawDeckCardImageNode = '';
      }
    };

    this.shuffleCards = function () {
      logEntry('Shuffling started.', 2);
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
      logEntry('Cards shuffled.', 1);
    };

    this.receiveCard = function (card) {
      this.cards.push(card);
      card.currentOwner = 'drawDeck';
    };
  }
}

class Player {
  constructor(isHuman, playerId) {
    this.isHuman = isHuman;
    this.playerId = parseInt(playerId);
    this.name = 'Player ' + playerId;
    this.cardsNode = '';
    this.cards = [];

    this.receiveCard = function (receivedCard) {
      receivedCard.currentOwner = this.playerId;
      this.cards.push(receivedCard);
      if (SHOW_ALL_CARDS || this.isHuman) {
        this.cardsNode.appendChild(receivedCard.cardImageNode);
        if (TURN_OFF_COMPUTER_PLAYING || this.isHuman) {
          receivedCard.cardImageNode.addEventListener(
            'click',
            this.playCard.bind(null, receivedCard),
            false
          );
        }
      } else {
        this.cardsNode.appendChild(receivedCard.backImageNode);
        if (TURN_OFF_COMPUTER_PLAYING) {
          receivedCard.backImageNode.addEventListener(
            'click',
            this.playCard.bind(null, receivedCard),
            false
          );
        }
      }
      logEntry('Card received, node updated.', 2);
    };

    this.playCard = function (card) {
      if (game.checkIfCardCanBePlayed(card)) {
        logEntry('Inside playCard @ player ' + card.currentOwner, 3);
        const currentOwner = game.table.seats.findIndex(
          (player) => player.playerId == card.currentOwner
        );
        logEntry('Found currentOwner-Index as follows: ' + currentOwner);
        const playedCardIndex = game.table.seats[currentOwner].cards.findIndex(
          (cardInHand) => cardInHand.uniqueID == card.uniqueID
        );
        logEntry('playCard function: playedCardIndex: ' + playedCardIndex, 3);
        game.table.seats[currentOwner].cards.splice(playedCardIndex, 1);
        if (!game.table.seats[currentOwner].isHuman && !SHOW_ALL_CARDS) {
          let imageNodeEntry = document.getElementById(card.uniqueID);
          logEntry(
            'Node entry for back card image @ ' +
              currentOwner +
              ' is ' +
              imageNodeEntry.innerHTML,
            3
          );
          game.table.seats[currentOwner].cardsNode.removeChild(imageNodeEntry);
        }
        game.setLastMove(currentOwner, 'discardPile', card.uniqueID);
        game.table.discardPile.receiveCard(card);
      }
    };

    this.computerPlayCard;
  }
}

const logEntry = (logText, depth = 1) => {
  if (LOG_DETAILS && LOG_DEPTH >= depth) {
    console.log(logText);
  }
};

const initStartScreen = () => {
  versionElement.innerText = 'Version: ' + MAU_MAU_VERSION;
  newGameButton.addEventListener('click', startNewGame);
};

const startNewGame = () => {
  logEntry('StartNewGame clicked', 1);
  game = new Game();
  game.shiftCardsToDrawDeck();
  game.table.drawDeck.shuffleCards();
  game.dealOutCards();
};

const shiftCardsToDrawDeck = () => {
  if (drawDeck.cards.length > 0) {
    drawDeck.cards = [];
  }
  drawDeck.cards = deckOfCards.cards;
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

// const playCard = (player, card) => {
//   game.table.discardPile.receiveCard(card);
// };

initStartScreen();
