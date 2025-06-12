const Ship = require('./ship');

class Board {
  /**
   * @param {number} size - length/width of board (square).
   */
  constructor(size = 10) {
    this.size = size;
    // 2-D array representation for display; '~' water, 'S' ship (hidden from opponent),
    // 'X' hit, 'O' miss
    this.grid = Array.from({ length: size }, () => Array(size).fill('~'));
    // List of Ship instances on this board
    this.ships = [];
  }

  /**
   * Checks whether a coordinate is inside board bounds.
   */
  isInBounds(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * Generates an array of coordinate strings for a potential ship placement.
   * @private
   */
  _generateShipCoords(row, col, length, orientation) {
    const coords = [];
    for (let i = 0; i < length; i++) {
      const r = orientation === 'horizontal' ? row : row + i;
      const c = orientation === 'horizontal' ? col + i : col;
      coords.push(`${r}${c}`);
    }
    return coords;
  }

  /**
   * Returns true if a ship can be placed at the requested positions (no collision or out-of-bounds).
   * @private
   */
  _canPlace(coords) {
    return coords.every(coord => {
      const r = parseInt(coord[0]);
      const c = parseInt(coord[1]);
      return this.isInBounds(r, c) && this.grid[r][c] === '~';
    });
  }

  /**
   * Places a ship randomly on the board.
   * @param {number} length
   * @returns {Ship} The newly placed Ship instance.
   */
  placeShipRandomly(length) {
    let placed = false;
    let newShip;

    while (!placed) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const startRow = orientation === 'horizontal'
        ? Math.floor(Math.random() * this.size)
        : Math.floor(Math.random() * (this.size - length + 1));
      const startCol = orientation === 'horizontal'
        ? Math.floor(Math.random() * (this.size - length + 1))
        : Math.floor(Math.random() * this.size);

      const coords = this._generateShipCoords(startRow, startCol, length, orientation);
      if (this._canPlace(coords)) {
        placed = true;
        newShip = new Ship(length, coords);
        this.ships.push(newShip);
        // Mark grid with ship for owner view only
        coords.forEach(coord => {
          const r = parseInt(coord[0]);
          const c = parseInt(coord[1]);
          this.grid[r][c] = 'S';
        });
      }
    }
    return newShip;
  }

  /**
   * Receive an attack from opponent.
   * @param {string} coord - coordinate string (e.g., '34').
   * @returns {{hit: boolean, sunk: boolean}}
   */
  receiveAttack(coord) {
    let hit = false;
    let sunk = false;

    for (const ship of this.ships) {
      if (ship.registerHit(coord)) {
        hit = true;
        sunk = ship.isSunk();
        break;
      }
    }

    const r = parseInt(coord[0]);
    const c = parseInt(coord[1]);
    this.grid[r][c] = hit ? 'X' : 'O';
    return { hit, sunk };
  }

  /**
   * Checks if all ships on the board have been sunk.
   */
  allShipsSunk() {
    return this.ships.every(s => s.isSunk());
  }

  /**
   * Returns displayable version of the board (masking ships if hideShips is true).
   */
  asString(hideShips = false) {
    let header = '  ';
    for (let i = 0; i < this.size; i++) header += i + ' ';
    const lines = [header];

    for (let r = 0; r < this.size; r++) {
      let line = r + ' ';
      for (let c = 0; c < this.size; c++) {
        let cell = this.grid[r][c];
        if (hideShips && cell === 'S') cell = '~';
        line += cell + ' ';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }
}

module.exports = Board; 