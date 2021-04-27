const MAU_MAU_VERSION = 'dev 0.1';
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


const logEntry = function(text, reportingLevel = 1, additionalObject = null, additionalValue = null) {
  if (LOG_DETAILS && reportingLevel <= LOG_DEPTH) {
    console.log(text);
  }
}


/**
 * Table - players [human, opponents]
 *       - decks [draw, discard]
 *               - cards
 */
class Table {
  players;
  drawDeck;
  discardPile;
  hasWinner;
  currentPlayer;
  totalNumberOfMoves;

  constructor() {
    this.players = [];
    this.drawDeck = new DrawDeck();
    this.discardPile = new DiscardPile();
    this.hasWinner = false;
    this.currentPlayer = 0;
    this.totalNumberOfMoves = 0;
  }
}

class Player {
  cards;
  id;

  constructor(id) {
    this.cards = [];
    this.id = id;
  }
}

class Human extends Player {
  isHuman;

  constructor() {
    super();
    this.isHuman = true;
  }
}

class Opponent extends Player {
  isHuman;

  constructor() {
    super();
    this.isHuman = false;
  }
}

class Deck {
  cards;

  constructor() {
    this.cards = [];
  }
}

class DrawDeck extends Deck {
  showCardFace;
  
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
  }

  discardPileNode = DISCARD_PILE_NODE;
  drawDeckNode = DRAW_DECK_NODE;
  opponentsNode = OPPONENTS_NODE;
  humanNode = HUMAN_NODE;


  updateDeckView = function() {
    this.discardPileNode.innerHTML = '';
    this.drawDeckNode.innerHTML = '';

    const decks = game.getDecks();
    if (decks.discardPileCards.length > 0) {
      const lastCardOnDiscardPile = decks.discardPileCards[decks.discardPileCards.length-1];
      const renderedCard = view.renderCard(lastCardOnDiscardPile, true, false, false);
      this.discardPileNode.appendChild(renderedCard);
    } else {
      // do nothing?
    }

    if (decks.drawDeckCards.length > 0) {
      const lastCardOnDrawDeck = decks.drawDeckCards[decks.drawDeckCards.length-1];
      const renderedCard = view.renderCard(lastCardOnDrawDeck, false, true, false);
      this.drawDeckNode.appendChild(renderedCard);
    } else {
      // do nothing?
    }

  }

  updatePlayerView = function() {
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
        const cardNode = view.renderCard(card, isHuman, isHuman, isHuman);
        playerCardsNode.appendChild(cardNode);
      }

      if (isHuman) {
        humanNode.appendChild(playerCardsNode);
      } else {
        opponentsNode.appendChild(playerCardsNode);
      }

    }
  }

  renderCard = function(card, frontFace = true, addEvent = false, eventAttachedToHuman = false) {
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
      cardNode.addEventListener('click', (function(cardCopy, eventAttachedToHumanCopy) { return function() {
        if (eventAttachedToHumanCopy) {
          game.playCard(cardCopy, 0);
        } else {
          game.drawCard(cardCopy, 0);
        }
        game.play.next();
      }})(card, eventAttachedToHuman));
    }
    
    return cardNode;
  };
    
}

// Controller
class Game {
  constructor() {
    this.play = '';
  }

  newGame = function() {
    table = new Table();
    view = new View();
    game.createPlayers();
    game.shuffleDeck();
    game.dealInitialCards();
    view.updateDeckView();
    view.updatePlayerView();
    game.play = game.playGenerator();
    game.play.next();
  }
  
  createPlayers = function() {
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
  
  shuffleDeck = function() {
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

  dealInitialCards = function() {
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let player of table.players) {
        console.log('Dealing to player ' + player.id);
        player.cards.push(table.drawDeck.cards.pop());
      }
    }
    table.discardPile.cards.push(table.drawDeck.cards.pop());
  }
  
  drawCard = function(card, playerId) {
    const indexOfCard = table.drawDeck.cards.findIndex(element => element == card);
    
    table.players[playerId].cards.push(card);
    table.drawDeck.cards.splice(indexOfCard, 1);
    
    view.updateDeckView();
    view.updatePlayerView();

    return card;
  }
  
  playCard = function(card, playerId) {
    console.log('game.playCard parameters received: cardId = ' + card.uniqueID + ' playerId: ' + playerId);
    const indexOfCard = table.players[playerId].cards.findIndex(element => element == card);
    console.log('inside game.playCard: ' + indexOfCard + ' player: ' + playerId);
    //const card = table.players[playerId].cards[indexOfCard];
    
    table.discardPile.cards.push(card);
    table.players[playerId].cards.splice(indexOfCard, 1);
    
    view.updateDeckView();
    view.updatePlayerView();
  }
  
  getDecks = function() {
    const decks = {
      drawDeckCards: table.drawDeck.cards,
      discardPileCards: table.discardPile.cards,
    }
    return decks;
  }
  
  getPlayers = function() {
    const players = [];
    for (const player of table.players) {
      players.push(player); 
    }
    return players;
  }
  
  getTopCardFromDiscardPile = function() {
    return table.discardPile.cards[table.discardPile.cards.length - 1];
  }

  playGenerator = function*() {
    while (!table.hasWinner) {
      if (table.players[table.currentPlayer].isHuman) {
        game.setNextPlayer();
        yield;
      } else {
        game.performOpponentAction(table.currentPlayer);
        game.setNextPlayer();
      }
      game.checkIfWeHaveAWinner();
      table.totalNumberOfMoves++;
      console.log('Generator, move #' + table.totalNumberOfMoves);
    }
  }

  setNextPlayer = function() {
    if (table.currentPlayer < (table.players.length - 1)) {
      table.currentPlayer++;
    } else {
      table.currentPlayer = 0;
    }
  }

  performOpponentAction = function(playerId) {
    let cards = table.players[playerId].cards;
    let playableCards = [];
    console.log('Inside performOpponentAction for player #' + playerId + ' with ' + cards.length + ' cards');
    cards.forEach(function(card) {
      console.log('inside cards.forEach at card #' + card.uniqueID);
      if (game.cardCanBePlayed(card)) {
        playableCards.push(card);
      }
      console.log('found a total of ' + playableCards.length + ' cards to play.')
    })
    if (playableCards.length == 0) {
      let drawnCard = game.drawCard(game.getTopCardFromDiscardPile(), table.currentPlayer);
      if (game.cardCanBePlayed(drawnCard))
      view.updateDeckView;
      view.updatePlayerView;
      playableCards = [];
      cards = table.players[playerId].cards;
      cards.forEach(function(card) {
        if (game.cardCanBePlayed(card)) {
          playableCards.push(card);
        }
      })
    }
    if (playableCards.length == 0) {
      game.setNextPlayer();
    } else {
      console.log('Applying lots of strategy....');
      const randomPileIndex = Math.floor(Math.random() * playableCards.length);
      console.log('Found this random index: ' + randomPileIndex);
      game.playCard(playableCards[randomPileIndex], table.currentPlayer);
    }
  }

  cardCanBePlayed = function(card) {
    logEntry('Trying game.getTopCardFromDiscardPile()...' + game.getTopCardFromDiscardPile().uniqueID, 1);
    let topCard = game.getTopCardFromDiscardPile();
    console.log('topcard: ' + topCard.color + topCard.value);
    console.log('topcard: ' + topCard.uniqueID + ' playerCard: ' + card.uniqueID);
    if (card.value == 'J' && topCard.value != 'J') {
      return true;
    } else if (card.value == topCard.value) {
      return true;
    } else if (card.color == topCard.color) {
      return true;
    } else {
      return false;
    }
  }

  checkIfWeHaveAWinner = function() {
    console.log('Checking winner');
  }
  
}

var table = new Table();
var view = new View();
var game = new Game();

newGameButton.addEventListener('click', game.newGame);
