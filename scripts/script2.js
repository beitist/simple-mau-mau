const MAU_MAU_VERSION = 'dev 0.03';
const LOG_DETAILS = true;
const LOG_DEPTH = 3;
const SHOW_ALL_CARDS = false;
const TURN_OFF_COMPUTER_PLAYING = false;
const CSS_NOT_DONE_YET = true;

const PATH_TO_CARD_IMAGES = 'img/png/';
const BACK_OF_CARD_IMAGE_SRC = 'img/png/red_back.png';

const NEW_GAME_BUTTON = document.getElementById('button-new-game');
const UNDO_BUTTON = document.getElementById('button-undo');
const TOP_TEN_BUTTON = document.getElementById('button-top-ten');
const CANT_BUTTON = document.getElementById('button-cant');

const versionElement = document.getElementById('header-version');

const OPPONENTS_NODE = document.getElementById('opponents');
const HUMAN_NODE = document.getElementById('player');
const DISCARD_PILE_NODE = document.getElementById('discard-pile');
const DRAW_DECK_NODE = document.getElementById('draw-deck');

const MODAL_OVERLAY = document.getElementById('modal-overlay');
const EXTEND_SEVEN_MODAL = document.getElementById('extend-seven-modal');
const EXTEND_SEVEN_YES = document.getElementById('extend-seven-yes');
const EXTEND_SEVEN_NO = document.getElementById('extend-seven-no');

// totalNumberOfPlayers wird später variabel gesetzt (ab V 1.1)!
let totalNumberOfPlayers = 3;
let cardsPerPlayer = 5;

let gameGoesClockwise = true;

let objectText = '';
let objectTextSpacing = '  ';
  
const logEntry = function(text, reportingLevel = 1, additionalObject = null, additionalValue = null) {
  if (LOG_DETAILS && reportingLevel <= LOG_DEPTH) {
    objectText = '';
    objectTextSpacing = '  ';
    let valueText = '';
    if (additionalObject != null) {
      objectText = '\nObject handed over. Data:\n';
      additionalObjectText = '';
      objectText += objectDiver(additionalObject);
    }
    if (additionalValue != null) {
      valueText = '\nAdditional value: ' + additionalValue;
    }
    let outputText = text + objectText + valueText;
    console.log(outputText);
  }
}

let additionalObjectText = '';

const objectDiver = function(object) {
  let n = 0;
  let objectEntries = Object.entries(object);
  for (const [key, value] of objectEntries) {
    if (typeof(value) == 'object' || typeof(value) == 'array') {
      logEntry('Inside typeOf diver!! n=' + n, 3);
      additionalObjectText = objectTextSpacing + `\nDiving into ${key}\n` 
      objectTextSpacing = '     ';
      objectDiver(value);
      objectTextSpacing  = '  ';
    } else {
      additionalObjectText = objectTextSpacing + `Key: ${key} with value: ${value}`
    }
    n++;
  }
  return additionalObjectText;
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

    if (addEvent && game.cardCanBePlayed(card)) {
      cardNode.addEventListener('click', (function(cardCopy, eventAttachedToHumanCopy) { return function() {
        if (eventAttachedToHumanCopy) {
          game.playCard(cardCopy, 0);
        } else {
          game.drawCard(cardCopy, 0);
        }
        game.nextMove();
      }})(card, eventAttachedToHuman));
    } 
    
    return cardNode;
  };

  toggleSevenModal = function() {
    MODAL_OVERLAY.classList.toggle('closed');
    EXTEND_SEVEN_MODAL.classList.toggle('closed');
  }
    
}

// Controller
class Game {
  constructor() {
    this.play = '';
    this.responseRequired = false;
    this.numberOfCardsToDraw = 0;
    this.requestedColor = '';
    this.mau = [];
    this.eightHasBeenResolved = true;
    this.unresolvedPostMoveCondition = false;
  }

  newGame = function() {
    table = new Table();
    view = new View();
    game.createPlayers();
    game.shuffleDeck();
    game.dealInitialCards();
    view.updateDeckView();
    view.updatePlayerView();
    // Testing to run the game without the generator!
    // game.play = game.playGenerator();
    // game.play.next();
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
        logEntry('Dealing to player ' + player.id);
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
    logEntry('game.playCard parameters received: cardId = ' + card.uniqueID + ' playerId: ' + playerId);
    const indexOfCard = table.players[playerId].cards.findIndex(element => element == card);
    logEntry('inside game.playCard: ' + indexOfCard + ' player: ' + playerId);
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

  nextMove = function() {
    table.totalNumberOfMoves++;
    game.postMoveConditions();
    if (game.checkIfWeHaveAWinner()) {
      game.congrats();
    }
    setNextPlayer();
    game.preMoveConditions();
    if (!table.players[table.currentPlayer].isHuman) {
      game.performOpponentAction();
    }
  }

  setNextPlayer = function() {
    if (table.currentPlayer < (table.players.length - 1)) {
      table.currentPlayer++;
    } else {
      table.currentPlayer = 0;
    }
  }

  preMoveConditions = function() {
    let lastPlayedCard = game.getTopCardFromDiscardPile();
    if (lastPlayedCard.value == 8) {
      game.setNextPlayer();
    }
    if (lastPlayedCard.value == 7) {
      game.numberOfCardsToDraw += 2;
      if (game.playerWantsToExtendSeven()) {
        game.numberOfCardsToDraw += 2;
        game.setNextPlayer();
      } else {
        for (let i = 0; i < game.numberOfCardsToDraw; i++) {
          game.drawCard(game.getTopCardFromDiscardPile(), table.currentPlayer)
        }
      }

    }
  }

  playerWantsToExtendSeven = function() {
    let cards = table.players[table.currentPlayer].cards;
    let playerId = table.currentPlayer;
    let indexOfSeven = cards.findIndex(card => card.value == 7);
    if (indexOfSeven >= 0 && !table.players[playerId].isHuman) {
      game.playCard(table.players[playerId].cards[indexOfSeven], playerId);
      game.numberOfCardsToDraw += 2;
      return true;
    } else if (indexOfSeven >= 0 && table.currentPlayer.isHuman) {
      view.toggleSevenModal();
      return true;
    }
    return false;
  }

  humanPlaysASeven = function() {
    sessionStorage
  }

  postMoveConditions() {
    if (game.unresolvedPostMoveCondition) {
      // RESOLVE THEN SET FALSE
      game.unresolvedPostMoveCondition = false;
      return true;
    } else {
      return true;
    }
  }

  performOpponentAction = function() {
    let playerId = table.currentPlayer;
    let cards = table.players[playerId].cards;
    let playableCards = [];
    if (game.responseRequired) {
      
      game.responseRequired = false;

    }
    logEntry('Inside performOpponentAction for player #' + playerId + ' with ' + cards.length + ' cards', 3);
    cards.forEach(function(card) {
      if (game.cardCanBePlayed(card)) {
        playableCards.push(card);
      }
      logEntry('found a total of ' + playableCards.length + ' cards to play.', 2, playableCards)
    })
    if (playableCards.length == 0) {
      let drawnCard = game.drawCard(game.getTopCardFromDiscardPile(), table.currentPlayer);
      if (game.cardCanBePlayed(drawnCard)) {
        game.playCard(drawnCard, table.currentPlayer);
      } 
    } else {
      logEntry('Applying lots of strategy.... :)');
      const randomPileIndex = Math.floor(Math.random() * playableCards.length);
      logEntry('Found this random index: ' + randomPileIndex);
      game.playCard(playableCards[randomPileIndex], table.currentPlayer);
    }
    view.updateDeckView();
    view.updatePlayerView();
    game.nextMove();
  }

  cardCanBePlayed = function(card) {
    logEntry('Trying game.getTopCardFromDiscardPile()...' + game.getTopCardFromDiscardPile().uniqueID, 1);
    let topCard = game.getTopCardFromDiscardPile();
    logEntry('topcard: ' + topCard.uniqueID + ' playerCard: ' + card.uniqueID);
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
    logEntry('Checking winner', 1);
  }

  congrats = function() {
    
  }
  
}


let table;
let view;
const game = new Game();

NEW_GAME_BUTTON.addEventListener('click', game.newGame);
CANT_BUTTON.addEventListener('click', game.nextMove);
EXTEND_SEVEN_YES.addEventListener('click', game.humanPlaysASeven);