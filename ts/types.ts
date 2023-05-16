export type GameState = {
  players: {player: Player; ai: Player};
};

export type Ship = {
  hits: number[];
  isSunk: boolean;
  locationArray: number[];
  name: string;
  axis: string;
};

export type Cell = {
  isShot: boolean;
  ship: Ship | undefined;
  ID: number;
};

export type Board = Cell[];

export type Player = {
  board: Board;
  ships: Ship[];
};
