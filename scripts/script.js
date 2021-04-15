const maumauVersion = 'dev 0.01';

const newGameButton = document.getElementById("button-new-game");
const undoButton = document.getElementById("button-undo");
const topTenButton = document.getElementById("button-top-ten");

const versionElement = document.getElementById("header-version");

let gameGoesClockwise = true;
let drawPile = [];
let discardPile = [];

let cardColors = ['diamond',
                  'heart',
                  'spades',
                  'club'];

let cardValues = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const initCardsAsObjects = () => {
  for (const color of cardColors) {
    for (const cardValue of cardValues) {
      const card = { cardColor : color,
                     cardValue: cardValue,
                     cardImageString: null };
      discardPile.push(card); 
    }
  }
  console.log(discardPile);
}

const initStartScreen = () => {
  versionElement.innerText = "Version: " + maumauVersion;
  initCardsAsObjects();
  // Event-Listener anbringen
  // Spielkarten-Objekte generieren + Grafiken!
  // Karten auf den Ablagestapel legen
}

const startNewGame = () => {
  // Ablagestapel = ganzes Kartenspiel, das mischen
  // Karten mischen, Karten austeilen, Stapel aufdecken
}

const shuffleCards = () => {
  // Ablagestapel mischen
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