import Board from './board.js';

class Player {
  constructor(name, boardSize = 10, shipConfig = { numberOfShips: 3, shipLength: 3 }) {
    this.name = name;
    this.board = new Board(boardSize);
    this.guesses = new Set(); // store coordinate strings guessed against opponent
    this.shipConfig = shipConfig;
    this._placeFleet();
  }

  /**
   * Place ships randomly according to config.
   * @private
   */
  _placeFleet() {
    const { numberOfShips, shipLength } = this.shipConfig;
    for (let i = 0; i < numberOfShips; i++) {
      this.board.placeShipRandomly(shipLength);
    }
  }

  /**
   * Register opponent attack onto this player's board.
   * @param {string} coord
   * @returns {{hit: boolean, sunk: boolean}}
   */
  receiveAttack(coord) {
    return this.board.receiveAttack(coord);
  }

  remainingShips() {
    return this.board.ships.filter(s => !s.isSunk()).length;
  }
}

export default Player; 