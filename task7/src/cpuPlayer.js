import Player from './player.js';

class CPUPlayer extends Player {
  constructor(name = 'CPU', boardSize = 10, shipConfig = { numberOfShips: 3, shipLength: 3 }) {
    super(name, boardSize, shipConfig);
    this.mode = 'hunt'; // 'hunt' | 'target'
    this.targetQueue = [];
  }

  /**
   * Generates a random coordinate in hunt mode ensuring it hasn't been guessed before.
   * @private
   */
  _hunt() {
    const size = this.board.size;
    let coord;
    do {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      coord = `${r}${c}`;
    } while (this.guesses.has(coord));
    return coord;
  }

  /**
   * Determines the next guess when in target mode.
   * @private
   */
  _target() {
    while (this.targetQueue.length) {
      const coord = this.targetQueue.shift();
      if (!this.guesses.has(coord)) return coord;
    }
    // Fallback to hunt if queue exhausted
    this.mode = 'hunt';
    return this._hunt();
  }

  /**
   * Decide next coordinate to fire at.
   * @returns {string} coordinate string
   */
  chooseAttackCoordinate() {
    if (this.mode === 'target' && this.targetQueue.length > 0) {
      return this._target();
    }
    return this._hunt();
  }

  /**
   * Parse results of attack to adjust strategy.
   * @param {string} coord - coordinate attacked
   * @param {{hit: boolean, sunk: boolean}} result - result of the attack
   */
  handleAttackResult(coord, result) {
    if (result.hit) {
      if (result.sunk) {
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        // Add adjacent cells to queue
        const row = parseInt(coord[0]);
        const col = parseInt(coord[1]);
        const adjacent = [
          { r: row - 1, c: col },
          { r: row + 1, c: col },
          { r: row, c: col - 1 },
          { r: row, c: col + 1 },
        ];
        adjacent.forEach(pos => {
          const { r, c } = pos;
          const coordStr = `${r}${c}`;
          if (r >= 0 && r < this.board.size && c >= 0 && c < this.board.size && !this.guesses.has(coordStr)) {
            if (!this.targetQueue.includes(coordStr)) this.targetQueue.push(coordStr);
          }
        });
        this.mode = 'target';
      }
    }
  }
}

export default CPUPlayer; 