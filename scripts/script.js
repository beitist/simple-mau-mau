const MAU_MAU_VERSION = 'dev 0.02';
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

const totalNumberOfPlayers = 3;

let gameGoesClockwise = true;
let drawPile = [];
let discardPile = [];
let table = [];

const initCardsToDiscardPile = () => {
  if (discardPile.length > 0) {
    discardPile = [];
  }
  for (const color of CARD_COLORS) {
    for (const cardValue of CARD_VALUES) {
      const card = makeCardObject(color, cardValue);
      discardPile.push(card); 
    }
  }
  discardPile = shuffleCards(discardPile);
}

const initStartScreen = () => {
  versionElement.innerText = "Version: " + MAU_MAU_VERSION;
  
  newGameButton.addEventListener('click', startNewGame);
}

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
  }

  return card;
}

const startNewGame = () => {
  initCardsToDiscardPile();
  for (let i = 1; i < totalNumberOfPlayers; i++) {}
  // Anzahl der Spielerhände initialisieren
  // Karten mischen, Karten austeilen, Stapel aufdecken
}

const shuffleCards = function(targetPile, drawPile = 0) {
  if (drawPile == 0) {
    drawPile = targetPile;
  }

  targetPile = [];

  for (let i = drawPile.length; i > 0; i--) {
    const randomPileIndex = Math.floor(Math.random() * i);
    targetPile.push(drawPile[randomPileIndex]);
    drawPile.splice(randomPileIndex, 1);
  }

  return targetPile;
}

const drawCardFromStack = (spieler) => {
  // an Spieler austeilen
}

const computerPlays = (computerPlayer) => {
  // Strategie für Spielzug, ausführen
}

const playerPlays = () => {

}

initStartScreen();