const readline = require('readline');
const Player = require('./player');
const CPUPlayer = require('./cpuPlayer');

class Game {
  constructor(options = {}) {
    const defaultOptions = {
      boardSize: 10,
      numberOfShips: 3,
      shipLength: 3,
    };
    this.options = { ...defaultOptions, ...options };

    const shipConfig = {
      numberOfShips: this.options.numberOfShips,
      shipLength: this.options.shipLength,
    };

    this.player = new Player('Player', this.options.boardSize, shipConfig);
    this.cpu = new CPUPlayer('CPU', this.options.boardSize, shipConfig); // CPUPlayer internally sets its own board/ships

    this.readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Print both boards side-by-side.
   */
  printBoards() {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    const header = '  ' + [...Array(this.options.boardSize).keys()].join(' ') + ' ';
    console.log(header + '     ' + header);

    for (let r = 0; r < this.options.boardSize; r++) {
      const opponentRow = [r, ...this.cpu.board.grid[r].map(cell => (cell === 'S' ? '~' : cell))].join(' ');
      const playerRow = [r, ...this.player.board.grid[r]].join(' ');
      console.log(`${opponentRow}    ${playerRow}`);
    }
    console.log('\n');
  }

  /**
   * Validate user input (two digits)
   */
  _isValidInput(input) {
    return /^[0-9]{2}$/.test(input) &&
      parseInt(input[0]) < this.options.boardSize &&
      parseInt(input[1]) < this.options.boardSize;
  }

  /**
   * Process player's guess at CPU board.
   * @param {string} coord
   * @returns {boolean} true if guess accepted and processed
   */
  playerTurn(coord) {
    if (!this._isValidInput(coord)) {
      console.log(`Invalid input. Enter two digits between 0 and ${this.options.boardSize - 1}.`);
      return false;
    }
    if (this.player.guesses.has(coord)) {
      console.log('You already guessed that coordinate!');
      return false;
    }

    this.player.guesses.add(coord);
    const result = this.cpu.receiveAttack(coord);
    if (result.hit) {
      console.log('HIT!');
      if (result.sunk) console.log('You sunk an enemy ship!');
    } else {
      console.log('MISS.');
    }
    return true;
  }

  /**
   * CPU executes its turn.
   */
  cpuTurn() {
    const coord = this.cpu.chooseAttackCoordinate();
    this.cpu.guesses.add(coord);
    const result = this.player.receiveAttack(coord);
    this.cpu.handleAttackResult(coord, result);

    console.log(`CPU fires at ${coord}: ${result.hit ? 'HIT' : 'MISS'}`);
    if (result.sunk) console.log('CPU sunk one of your ships!');
  }

  /**
   * Check for game over conditions.
   */
  isGameOver() {
    if (this.cpu.board.allShipsSunk()) {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy ships! ***');
      return true;
    }
    if (this.player.board.allShipsSunk()) {
      console.log('\n*** GAME OVER! CPU sunk all your ships! ***');
      return true;
    }
    return false;
  }

  /**
   * Begin interactive game loop.
   */
  start() {
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${this.options.numberOfShips} enemy ships.`);
    this._turnLoop();
  }

  _turnLoop() {
    if (this.isGameOver()) {
      this.printBoards();
      this.readlineInterface.close();
      return;
    }

    this.printBoards();
    this.readlineInterface.question('Enter your guess (e.g., 00): ', input => {
      const processed = this.playerTurn(input);
      if (processed) {
        if (!this.cpu.board.allShipsSunk()) {
          this.cpuTurn();
        }
      }
      // Next loop
      this._turnLoop();
    });
  }
}

module.exports = Game; 