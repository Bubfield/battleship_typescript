export default class View {
  $: Record<string, Element> = {};

  constructor() {
    this.$.placeShipsScreen = this.#qs('[data-id="place-ships-screen"]');
    this.$.battleScreen = this.#qs('[data-id="battle-screen"]');
    this.$.playerBoardShipsPS = this.#qs("#player-board-1-PS");
    this.$.playerBoardSquaresPS = this.#qs("#player-board-2-PS");
    this.$.playerBoardShipsBS = this.#qs("#player-board-1-BS");
    this.$.playerBoardSquaresBS = this.#qs("#player-board-2-BS");
    this.$.aiBoardShips = this.#qs("#ai-board-1");
    this.$.aiBoardSquares = this.#qs("#ai-board-2");
    this.$.axisBtn = this.#qs('[data-id="axis-btn"]');
    this.$.modal = this.#qs('[data-id="modal"]');
    this.$.modalText = this.#qs('[data-id="modal-text"]');
    this.$.modalBtn = this.#qs('[data-id="modal-btn"]');
  }

  renderBattleScreen(
    playerShipsSVGInfo: {
      row: number;
      column: number;
      axis: string;
      shipObj: {name: string; length: number};
    }[]
  ) {
    const placeShipsScreenHTML = this.$.placeShipsScreen as HTMLElement;

    placeShipsScreenHTML.style.animation =
      "2s linear 0s 1 normal none running fadeout";

    setTimeout(() => {
      this.$.placeShipsScreen.classList.add("display-hidden");
    }, 2000);

    setTimeout(() => {
      this.$.battleScreen.classList.remove("display-hidden");

      this.renderPlayerBoard("battle screen");

      playerShipsSVGInfo.forEach((shipSVGInfo) =>
        this.createShipSVG(shipSVGInfo, "battle screen", "player")
      );

      this.renderAiBoard();
      placeShipsScreenHTML.style.animation = "";
    }, 2000);
  }

  renderSquares(board: Element, whichPlayer: string) {
    for (let i = 0; i < 100; i++) {
      const squareDiv = document.createElement("div");
      squareDiv.classList.add(`${whichPlayer}-square`);
      if (whichPlayer === "ai") squareDiv.classList.add("square-not-shot");
      squareDiv.setAttribute("data-id", `${i}`);
      board.append(squareDiv);
    }
  }

  renderPlayerBoard(screen: string) {
    if (screen === "place ships screen") {
      this.renderSquares(this.$.playerBoardSquaresPS, "player");
    } else {
      this.renderSquares(this.$.playerBoardSquaresBS, "player");
    }
  }

  renderAiBoard() {
    this.renderSquares(this.$.aiBoardSquares, "ai");
  }

  bindPlaceShipsClick(handler: (el: Element) => void) {
    this.#delegate(
      this.$.playerBoardSquaresPS,
      ".player-square",
      "click",
      handler
    );
  }

  bindPlaceShipsMouseOver(handler: (el: Element) => void) {
    this.#delegate(
      this.$.playerBoardSquaresPS,
      ".player-square",
      "mouseover",
      handler
    );
  }

  bindPlaceShipsMouseOut(handler: (el: Element) => void) {
    this.#delegate(
      this.$.playerBoardSquaresPS,
      ".player-square",
      "mouseout",
      handler
    );
  }

  bindChangeAxis(handler: (e: Event) => void) {
    this.$.axisBtn.addEventListener("click", handler);
  }

  bindMakeMove(handler: (el: Element) => void) {
    this.#delegate(this.$.aiBoardSquares, ".ai-square", "click", handler);
  }

  bindReset(handler: (e: Event) => void) {
    this.$.modalBtn.addEventListener("click", handler);
  }

  changeAxis() {
    if (this.$.axisBtn.textContent === "Axis: X") {
      this.$.axisBtn.textContent = "Axis: Y";
    } else {
      this.$.axisBtn.textContent = "Axis: X";
    }
  }

  clearPlaceShipScreenAnimation() {
    const placeShipsScreenHTML = this.$.placeShipsScreen as HTMLElement;
    placeShipsScreenHTML.style.animation = "";
  }

  placeShipHelper(
    square: HTMLElement,
    shipLength: number,
    axis: string,
    color: string
  ) {
    let idNumber = Number(square.dataset.id);

    for (let i = 0; i < shipLength; i++) {
      let squareEl = document.querySelector(
        `.player-square[data-id='${idNumber + i * (axis === "x" ? 1 : 10)}']`
      ) as HTMLElement;

      if (squareEl) {
        squareEl.style.backgroundColor = color;
        squareEl.style.cursor = "pointer";
      }
    }
  }

  createShipSVG(
    shipSVGInfo: {
      row: number;
      column: number;
      axis: string;
      shipObj: {name: string; length: number};
    },
    screen: string,
    board?: string,
    sunk?: string
  ) {
    const {row, column, axis, shipObj} = shipSVGInfo;
    const {name, length} = shipObj;

    const gridAreaXaxis = `span 1 / span ${length}`;
    const gridAreaYaxis = `span ${length} / span 1`;

    const shipSVGDiv = document.createElement("div");
    shipSVGDiv.style.display = "flex";
    shipSVGDiv.style.height = "100%";
    shipSVGDiv.style.gridArea = `${row} / ${column} / ${
      axis === "x" ? gridAreaXaxis : gridAreaYaxis
    }`;

    const img = document.createElement("img");
    img.setAttribute(
      "src",
      `../shipSVGs/${name}SVG/${board === "ai" || sunk ? "sunk" : ""}${
        axis === "x" ? name : name + "Y"
      }.svg`
    );
    img.setAttribute("alt", `${name} ship`);
    img.style.width = "100%";

    shipSVGDiv.append(img);

    if (screen === "place ships screen") {
      this.$.playerBoardShipsPS.append(shipSVGDiv);
    } else {
      if (board === "player") {
        this.$.playerBoardShipsBS.append(shipSVGDiv);
      } else {
        this.$.aiBoardShips.append(shipSVGDiv);
      }
    }
  }

  createHitMarkSVG(
    moveMessage: string,
    square?: HTMLElement,
    board?: string,
    squareID?: number
  ) {
    const img = document.createElement("img");
    img.setAttribute("src", `./shot-marker-${moveMessage}.svg`);
    img.setAttribute("alt", "hit mark");
    img.style.margin = "auto";

    if (board === "player") {
      let square2 = document.querySelector(
        `#player-board-2-BS .player-square[data-id='${squareID}']`
      ) as HTMLElement;

      square2.append(img);
    } else {
      if (square) {
        square.append(img);
        square.classList.add("square-shot");
      }
    }
  }

  invalidShipPlacement(square: HTMLElement) {
    square.style.backgroundColor = "rgb(255, 15, 15, 0.6)";
    square.style.cursor = "not-allowed";
  }

  openModal(message: string) {
    this.$.modal.classList.remove("display-hidden");
    this.$.battleScreen.classList.add("display-hidden");
    const modalTextHTML = this.$.modalText as HTMLElement;
    modalTextHTML.innerText = message;
  }

  closeModal() {
    this.$.modal.classList.add("display-hidden");
    this.$.placeShipsScreen.classList.remove("display-hidden");
  }

  #qs(selector: string, parent?: Element) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) throw new Error("Could not find element");

    return el;
  }

  #delegate(
    el: Element,
    selector: string,
    eventKey: string,
    handler: (el: Element) => void
  ) {
    el.addEventListener(eventKey, (event) => {
      if (!(event.target instanceof Element)) {
        throw new Error("event target not found");
      }

      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
