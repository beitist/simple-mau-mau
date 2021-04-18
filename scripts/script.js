const MAU_MAU_VERSION = 'dev 0.03';
const LOG_DETAILS = true;

const PATH_TO_CARD_IMAGES = '/img/png/';
const BACK_OF_CARD_IMAGE = '/img/png/red_back.png';

const CARD_COLORS = ['diamond',
'heart',
'spades',
'club'];

const CARD_VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const newGameButton = document.getElementById("button-new-game");
const undoButton = document.getElementById("button-undo");
const topTenButton = document.getElementById("button-top-ten");

const versionElement = document.getElementById("header-version");

const opponentsNode = document.getElementById("opponents");
const playerCardsNode = document.getElementById("player-cards");
const discardPileNode = document.getElementById("discard-pile");
const drawPileNode = document.getElementById("draw-pile");

// totalNumberOfPlayers wird später variabel gesetzt (ab V 1.1)!
let totalNumberOfPlayers = 3;
let cardsPerPlayer = 5;

let gameGoesClockwise = true;

let drawPile = { 
  cards: [],
  renderTopCard : () => {
    console.log("Hi");
  }
};

let discardPile = {
  cards: [],
  renderLastCard : () => {
    if (this.cards.length > 0) {
      discardPileNode.style += 'background-image: url("' + BACK_OF_CARD_IMAGE + '")';
    } else {
      discardPileNode.style = '';
    }
  },
  shuffleCards : function shuffleCards() {
    let tempPile = [];
    discardPile.cards.forEach(function(card) {
      tempPile.push(card);
    });
    discardPile.cards = [];
    for (let i = tempPile.length; i > 0; i--) {
      const randomPileIndex = Math.floor(Math.random() * i);
      discardPile.cards.push(tempPile[randomPileIndex]);
      tempPile.splice(randomPileIndex, 1);
    };
    logEntry("Cards shuffled.");
  },
};

let table = [];

const logEntry = (logText) => {
  if (LOG_DETAILS) {
    console.log(logText);
  };
};

const initStartScreen = () => {
  versionElement.innerText = "Version: " + MAU_MAU_VERSION;
  newGameButton.addEventListener('click', startNewGame);
  initCardsToDiscardPile();
}

const initCardsToDiscardPile = () => {
  if (discardPile.cards.length > 0) {
    discardPile.cards = [];
  }
  for (const color of CARD_COLORS) {
    for (const cardValue of CARD_VALUES) {
      const card = makeCardObject(color, cardValue);
      discardPile.cards.push(card);
      logEntry("Created a card with values " + color + " " + cardValue);
    };
  };
};

const startNewGame = () => {
  table = [];
  logEntry("StartNewGame clicked");
  initPlayers();
  initCardsToDiscardPile();
  discardPile.shuffleCards();
  // Karten mischen, Karten austeilen, Stapel aufdecken
}

const initPlayers = () => {
  opponentsNode.innerHTML = '';
  playerCardsNode.innerHTML = '';
  for (let i = 0; i < totalNumberOfPlayers; i++) {
    let hand = [];
    table.push(hand);
    if (i > 0) {
      opponentsNode.innerHTML += `<div id="player${i}">
      <p id="player${i}-cards"></p>
      <p id="player${i}-name">Player ${i}</p>
      </div>`;
    };
  };
logEntry("Players generated; in total: " + table.length);
};

const makeCardObject = function(color, cardValue) {
  let cardScoreValue = 0;
  if (cardValue == "A") {
    cardScoreValue = 11;
  } else if (cardValue > 6 && cardValue < 11) {
    cardScoreValue = parseInt(cardValue);
  } else {
    cardScoreValue = 10;
  }

  const cardImageFile = cardValue + color[0].toUpperCase() + '.png';
  const cardImageFileAndPath = PATH_TO_CARD_IMAGES + cardImageFile;

  const card = {
    value : cardValue,
    color : color,
    score : cardScoreValue,
    imageSrc : cardImageFileAndPath
  };

  return card;
};

const drawCardFromStack = (spieler) => {
  // an Spieler austeilen
}

const computerPlays = (computerPlayer) => {
  // Strategie für Spielzug, ausführen
}

const playerPlays = () => {

}

initStartScreen();