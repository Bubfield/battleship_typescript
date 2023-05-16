import {Ship} from "../types";
import View from "../view.js";

const view = new View();

export default function createShipSVGWhenShipIsSunk(
  ship: Ship | undefined,
  player: string,
  sunk?: string
) {
  if (ship?.isSunk) {
    const axis = ship?.axis as string;

    let row = ship.locationArray[0].toString()[0];
    let column = ship.locationArray[0].toString()[1];

    if (!column) {
      column = row;
      row = "0";
    }

    const shipName = ship?.name as string;
    const shipLength = ship?.locationArray.length as number;

    const shipObj = {name: shipName, length: shipLength};

    const shipSVGInfo = {
      row: Number(row) + 1,
      column: Number(column) + 1,
      axis,
      shipObj,
    };

    view.createShipSVG(shipSVGInfo, "battle screen", player, sunk);
  }
}
