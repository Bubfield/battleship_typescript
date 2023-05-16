import Store from "./store.js";
import View from "./view.js";
import createShipSVGWhenShipIsSunk from "./helperFunctions/createShipSVGWhenShipIsSunk.js";

const placeShipsHelper = {
  ships: [
    {name: "carrier", length: 5},
    {name: "battleship", length: 4},
    {name: "destroyer", length: 3},
    {name: "submarine", length: 3},
    {name: "patrol", length: 2},
    {name: "done", length: 1},
  ],
  i: 0,
  axis: "x",
};

let playerShipsSVGInfo: {
  row: number;
  column: number;
  axis: string;
  shipObj: {name: string; length: number};
}[] = [];

function init() {
  const store = new Store();
  const view = new View();

  view.renderPlayerBoard("place ships screen");

  view.bindPlaceShipsClick((square) => {
    const i = placeShipsHelper.i;

    if (i >= 5) return;

    const currentShip = placeShipsHelper.ships[i];
    const axis = placeShipsHelper.axis;
    const squareHTML = square as HTMLElement;
    const squareID = Number(squareHTML.dataset.id);
    const player = store.getState().players.player;

    if (
      !store.checkValidShipPlacement(
        squareID,
        currentShip.length,
        axis,
        player.board
      )
    ) {
      return;
    }

    store.placeShip(squareID, currentShip, player, axis);

    view.placeShipHelper(square as HTMLElement, currentShip.length, axis, "");

    let row = squareID.toString()[0];
    let column = squareID.toString()[1];

    if (!column) {
      column = row;
      row = "0";
    }

    const shipSVGInfo = {
      row: Number(row) + 1,
      column: Number(column) + 1,
      axis,
      shipObj: currentShip,
    };

    playerShipsSVGInfo.push(shipSVGInfo);

    view.createShipSVG(shipSVGInfo, "place ships screen");

    view.invalidShipPlacement(square as HTMLElement);

    placeShipsHelper.i++;

    if (placeShipsHelper.i === 5) {
      store.placeAiShipsRandomly(placeShipsHelper.ships);
      view.renderBattleScreen(playerShipsSVGInfo);
    }
  });

  view.bindPlaceShipsMouseOver((square) => {
    const i = placeShipsHelper.i;
    const currentShip = placeShipsHelper.ships[i];
    const axis = placeShipsHelper.axis;
    const squareHTML = square as HTMLElement;
    const squareID = Number(squareHTML.dataset.id);
    const playerBoard = store.getState().players.player.board;

    if (
      i >= 5 ||
      !store.checkValidShipPlacement(
        squareID,
        currentShip.length,
        axis,
        playerBoard
      )
    ) {
      view.invalidShipPlacement(square as HTMLElement);
    } else {
      view.placeShipHelper(
        square as HTMLElement,
        currentShip.length,
        axis,
        "lightblue"
      );
    }
  });

  view.bindPlaceShipsMouseOut((square) => {
    const i = placeShipsHelper.i;
    const currentShip = placeShipsHelper.ships[i];
    const axis = placeShipsHelper.axis;
    view.placeShipHelper(square as HTMLElement, currentShip.length, axis, "");
  });

  view.bindChangeAxis(() => {
    const axis = placeShipsHelper.axis;
    placeShipsHelper.axis = axis === "x" ? "y" : "x";
    view.changeAxis(placeShipsHelper.axis);
  });

  view.bindMakeMove((square) => {
    const ai = store.getState().players.ai;
    const player = store.getState().players.player;
    const aiTurn = store.getState().aiTurn;

    const squareHTML = square as HTMLElement;
    const squareID = Number(squareHTML.dataset.id);

    if (ai.board[squareID].isShot || aiTurn) return;

    const ship = ai.board[squareID].ship;

    const moveMessage = store.makeMove(squareID, ai);
    view.createHitMarkSVG(moveMessage, square as HTMLElement);

    createShipSVGWhenShipIsSunk(ship, "ai");

    if (store.checkWin(ai)) {
      view.openModal("Player wins!");
    }

    store.getState().aiTurn = true;

    setTimeout(() => {
      const unShotSquares = store.filterMovesForAI();
      const randomIndex = Math.floor(Math.random() * unShotSquares.length);
      const playerSquareID = unShotSquares[randomIndex].ID;

      const moveMessage2 = store.makeMove(playerSquareID, player);
      view.createHitMarkSVG(moveMessage2, undefined, "player", playerSquareID);

      const ship = player.board[playerSquareID].ship;

      createShipSVGWhenShipIsSunk(ship, "player", "sunk");

      if (store.checkWin(player)) {
        view.openModal("AI wins!");
      }

      store.getState().aiTurn = false;
    }, 3000);
  });

  view.bindReset(() => {
    store.resetState();
    view.closeModal();
    view.clearBoards();
    view.renderPlayerBoard("place ships screen");
    placeShipsHelper.i = 0;
    playerShipsSVGInfo = [];
  });
}

window.addEventListener("load", init);
