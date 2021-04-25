const MAU_MAU_VERSION = 'dev 0.03';
const LOG_DETAILS = true;
const LOG_DEPTH = 3;
const SHOW_ALL_CARDS = false;
const TURN_OFF_COMPUTER_PLAYING = false;
const CSS_NOT_DONE_YET = true;

const PATH_TO_CARD_IMAGES = 'img/png/';
const BACK_OF_CARD_IMAGE_SRC = 'img/png/red_back.png';

const newGameButton = document.getElementById('button-new-game');
const undoButton = document.getElementById('button-undo');
const topTenButton = document.getElementById('button-top-ten');

const versionElement = document.getElementById('header-version');

const OPPONENTS_NODE = document.getElementById('opponents');
const HUMAN_NODE = document.getElementById('player');

const DISCARD_PILE_NODE = document.getElementById('discard-pile');
const DRAW_DECK_NODE = document.getElementById('draw-deck');

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
    this.drawDeck = new DrawDeck();
    this.discardPile = new DiscardPile();
  }
}

class Player {
  constructor(id) {
    this.cards = [];
    this.id = id;
  }
}

class Human extends Player {
  constructor() {
    super();
    this.isHuman = true;
  }
}

class Opponent extends Player {
  constructor() {
    super();
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
    super();
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
}

class DiscardPile extends Deck {
  constructor() {
    super();
    this.showCardFace = true;
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

  }
}


// View
class View {
  constructor() {
    this.discardPileNode = DISCARD_PILE_NODE;
    this.drawDeckNode = DRAW_DECK_NODE;
    this.opponentsNode = OPPONENTS_NODE;
    this.humanNode = HUMAN_NODE;

    this.updateDeckView = function() {
      this.discardPileNode.innerHTML = '';
      this.drawDeckNode.innerHTML = '';

      const decks = game.getDecks();
      if (decks.discardPileCards.length > 0) {
        const lastCardOnDiscardPile = decks.discardPileCards[decks.discardPileCards.length-1];
        const renderedCard = this.renderCard(lastCardOnDiscardPile, true, false, false);
        this.discardPileNode.appendChild(renderedCard);
      } else {
        // do nothing?
      }

      if (decks.drawDeckCards.length > 0) {
        const lastCardOnDrawDeck = decks.drawDeckCards[decks.drawDeckCards.length-1];
        const renderedCard = this.renderCard(lastCardOnDrawDeck, false, true, false);
        this.drawDeckNode.appendChild(renderedCard);
      } else {
        // do nothing?
      }

    }

    this.updatePlayerView = function() {
      const players = game.getPlayers();
      const humanNode = HUMAN_NODE;
      const opponentsNode = OPPONENTS_NODE;

      humanNode.innerHTML = '';
      opponentsNode.innerHTML = '';

      for (const player of players) {
        const isHuman = player.isHuman;

        let playerCardsNode = document.createElement('div');
        playerCardsNode.classList.add('player-cards');
        playerCardsNode.id = 'player' + player.id;

        for (const card of player.cards) {
          const cardNode = this.renderCard(card, isHuman, isHuman, isHuman);
          playerCardsNode.appendChild(cardNode);
        }

        if (isHuman) {
          humanNode.appendChild(playerCardsNode);
        } else {
          opponentsNode.appendChild(playerCardsNode);
        }

      }
    }

    this.renderCard = function(card, frontFace = true, addEvent = false, eventAttachedToHuman = false) {
      let cardNode = document.createElement('img');
      cardNode.width = '60';
      cardNode.classList.add('card');
      cardNode.id = card.uniqueID;

      if (frontFace) {
        cardNode.src = card.imageSrc;
      } else { 
        cardNode.src = BACK_OF_CARD_IMAGE_SRC;
      }

      if (addEvent) {
        cardNode.addEventListener('click', (function(idCopy, eventAttachedToHumanCopy) { return function() {
          if (eventAttachedToHumanCopy) {
            game.playCard(idCopy, 0);
          } else {
            game.drawCard(idCopy, 0);
          }
        }})(card.uniqueID, eventAttachedToHuman));
      }

      return cardNode;
    }

  }
}

// Controller
class Game {
  constructor() {
    this.newGame = function() {
      table = new Table();
      view = new View();
      this.createPlayers();
      this.shuffleDeck();
      view.updateDeckView();
      view.updatePlayerView();
    }

    this.createPlayers = function() {
      for (let i = 0; i < totalNumberOfPlayers; i++) {
        let player = '';
        if (i == 0) {
          player = new Human();
        } else {
          player = new Opponent();
        }
        player.id = i;
        table.players.push(player);
      }
    }

    this.getDecks = function() {
      const decks = {
        drawDeckCards: table.drawDeck.cards,
        discardPileCards: table.discardPile.cards,
      }
      return decks;
    }

    this.getPlayers = function() {
      const players = [];
      for (const player of table.players) {
        players.push(player); 
      }
      return players;
    }

    this.drawCard = function(cardId, playerId) {
      console.log(cardId);
      const indexOfCardWithCardId = table.drawDeck.cards.findIndex(element => element.uniqueID == cardId);
      const card = table.drawDeck.cards[indexOfCardWithCardId];

      table.players[playerId].cards.push(card);
      table.drawDeck.cards.splice(indexOfCardWithCardId, 1);

      view.updateDeckView();
      view.updatePlayerView();
    }

    this.playCard = function(cardId, playerId) {
      const indexOfCardWithCardId = table.players[playerId].cards.findIndex(element => element.uniqueID == cardId);
      const card = table.players[playerId].cards[indexOfCardWithCardId];

      table.discardPile.cards.push(card);
      table.players[playerId].cards.splice(indexOfCardWithCardId, 1);

      view.updateDeckView();
      view.updatePlayerView();
    }

    this.shuffleDeck = function() {
      const decks = this.getDecks();
      let tempPile = [];

      if (decks.discardPileCards.length == 0) {
        decks.drawDeckCards.forEach(function (card) {
          tempPile.push(card);
        });
        table.drawDeck.cards = [];
      } else if (decks.drawPileCards.length == 0 && decks.discardPileCards.length > 0) {
        const topCard = this.getTopCardFromDiscardPile();
        decks.discardPileCards.forEach(function (card) {
          tempPile.push(card);
        });
        table.discardPile.cards = [];
        table.discardPile.cards.push(topCard);
      }

      for (let i = tempPile.length; i > 0; i--) {
        const randomPileIndex = Math.floor(Math.random() * i);
        table.drawDeck.cards.push(tempPile[randomPileIndex]);
        tempPile.splice(randomPileIndex, 1);
      }

      table.drawDeck.cards.reverse();

    };

    this.getTopCardFromDiscardPile = function() {
      return table.discardPile.cards[table.discardPile.length - 1];
    }
    
  }
}

let table = new Table();
let view = new View();
const game = new Game();

game.newGame();