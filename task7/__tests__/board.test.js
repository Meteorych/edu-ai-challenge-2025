import Board from '../src/board.js';

describe('Board', () => {
  test('placeShipRandomly places correct number of ships without collision', () => {
    const board = new Board(10);
    for (let i = 0; i < 5; i++) {
      board.placeShipRandomly(3);
    }
    expect(board.ships.length).toBe(5);

    // Ensure no overlapping coordinates
    const allCoords = board.ships.flatMap(s => s.locations);
    const unique = new Set(allCoords);
    expect(unique.size).toBe(allCoords.length);
  });

  test('receiveAttack updates grid and returns proper result', () => {
    const board = new Board(10);
    // Manually place a small ship at 00 & 01
    board.grid[0][0] = 'S';
    board.grid[0][1] = 'S';
    board.ships.push({
      locations: ['00', '01'],
      hits: ['', ''],
      registerHit(coord) {
        const idx = this.locations.indexOf(coord);
        if (idx !== -1) {
          this.hits[idx] = 'hit';
          return true;
        }
        return false;
      },
      isSunk() {
        return this.hits.every(h => h === 'hit');
      },
    });

    let result = board.receiveAttack('00');
    expect(result.hit).toBe(true);
    expect(board.grid[0][0]).toBe('X');

    result = board.receiveAttack('22');
    expect(result.hit).toBe(false);
    const r = 2, c = 2;
    expect(board.grid[r][c]).toBe('O');
  });
}); 