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

/**
 * Table - players [human, opponents]
 *       - decks [draw, discard]
 *               - cards
 */
class Table {
  constructor() {
    this.players = [];
    this.nextPlayer = NULL;

    this.drawDeck = new DrawDeck();
    this.discardPile = new DiscardPile();
  }
}

class Player {
  constructor(id) {
    this.hand = {};
    this.id = id;

  }
}

class Human extends Player {
  constructor() {
    this.isHuman = true;
  }
}

class Opponent extends Player {
  constructor() {
    this.isHuman = false;
  }
}

class Deck {
  constructor() {
    this.cards = [];
  }
}

class DrawDeck extends Deck {
  constructor() {
    const CARD_COLORS = ['diamond', 'heart', 'spades', 'club'];
    const CARD_VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const color of CARD_COLORS) {
      for (const cardValue of CARD_VALUES) {
        const card = new Card(color, cardValue);
        this.cards.push(card);
      }
    }

    this.showCardFace = false;

}

class DiscardPile extends Deck {
  constructor() {
    this.showCardFace = true;
  }
}

class Card {
  constructor(color, value) {
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


// View
class View {
  constructor() {
    this.opponentNodes = [];
    this.humanNodes = [];
}
}

class HumanView {
  constructor(id) {
    this.id = id;

    this.cardsNode = 
  }
}

class OpponentView {
  constructor() {

  }
}


// Controller
class Game {
  constructor() {
    this.PlayerController = new PlayerController();
    this.OpponentController = new OpponentController();
  }
}


// class Moves {
//   constructor() {
//   }
// }

class PlayerController {
  constructor() {

    this.receiveCard = function (card) {
      const re
    }
  }
}

class OpponentController {
  constructor() {

  }
}

class PileController {
  constructor() {

  }
}




const table = new Table();
const view = new View();
const game = new Game();