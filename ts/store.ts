import {GameState, Board, Cell, Player, Ship} from "./types";

export default class Store {
  state: GameState;
  aiTurn: boolean;

  constructor() {
    this.state = {
      players: {player: this.createPlayer(), ai: this.createPlayer()},
    };
    this.aiTurn = false;
  }

  createCell(ID: number): Cell {
    return {isShot: false, ship: undefined, ID};
  }

  createBoard(): Board {
    const board = [];

    for (let i = 0; i < 100; i++) {
      const cell = this.createCell(i);
      board.push(cell);
    }

    return board;
  }

  createPlayer(): Player {
    return {board: this.createBoard(), ships: []};
  }

  createShip(locationArray: number[], name: string, axis: string): Ship {
    return {
      hits: [],
      isSunk: false,
      locationArray,
      name,
      axis,
    };
  }

  placeShip(
    squareId: number,
    ship: {name: string; length: number},
    player: Player,
    axis: string
  ) {
    const shipLocationArray: number[] = [];
    const newShip = this.createShip(shipLocationArray, ship.name, axis);

    for (let i = 0; i < ship.length; i++) {
      const squareIndex = squareId + i * (axis === "x" ? 1 : 10);
      player.board[squareIndex].ship = newShip;
      newShip.locationArray.push(squareIndex);
    }

    player.ships.push(newShip);
  }

  placeAiShipsRandomly(ships: {name: string; length: number}[]) {
    const ai = this.getState().players.ai;

    for (let i = 0; i < ships.length - 1; i++) {
      let randomAxis = ["x", "y"][Math.floor(Math.random() * 2)];
      let randomSquareID = Math.floor(Math.random() * 100);

      while (
        !this.checkValidShipPlacement(
          randomSquareID,
          ships[i].length,
          randomAxis,
          ai.board
        )
      ) {
        randomAxis = ["x", "y"][Math.floor(Math.random() * 2)];
        randomSquareID = Math.floor(Math.random() * 100);
      }

      this.placeShip(randomSquareID, ships[i], ai, randomAxis);
    }
  }

  checkValidShipPlacement(
    squareIdNumber: number,
    currentShipLength: number,
    axis: string,
    playerBoard: Board
  ) {
    const invalidCombinations: number[][] = [
      [9, 10],
      [19, 20],
      [29, 30],
      [39, 40],
      [49, 50],
      [59, 60],
      [69, 70],
      [79, 80],
      [89, 90],
    ];

    const locationArray: number[] = [];

    for (let j = 0; j < currentShipLength; j++) {
      let squareID = squareIdNumber + j * (axis === "x" ? 1 : 10);

      if (squareID >= 100) return false;

      if (playerBoard[squareID].ship) {
        return false;
      }

      locationArray.push(squareID);
    }

    for (const combination of invalidCombinations) {
      if (combination.every((num) => locationArray.includes(num))) {
        return false;
      }
    }

    return true;
  }

  makeMove(squareID: number, player: Player): string {
    let message = "miss";
    const square = player.board[squareID];

    square.isShot = true;

    if (square.ship) {
      square.ship.hits.push(squareID);
      message = "hit";

      if (
        square.ship.locationArray.every((location) =>
          square.ship?.hits.includes(location)
        )
      ) {
        square.ship.isSunk = true;
      }
    }

    return message;
  }

  filterMovesForAI() {
    return this.getState().players.player.board.filter(
      (square) => !square.isShot
    );
  }

  checkWin(player: Player) {
    return player.ships.every((ship) => ship.isSunk);
  }

  // saveState(newState: GameState): void {
  //   state = newState;
  // }

  getState(): GameState {
    return this.state;
  }
}
