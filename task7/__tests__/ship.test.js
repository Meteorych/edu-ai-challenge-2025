import Ship from '../src/ship.js';

describe('Ship', () => {
  test('registerHit marks hits and isSunk returns correct status', () => {
    const locations = ['00', '01', '02'];
    const ship = new Ship(3, locations);

    expect(ship.isSunk()).toBe(false);

    expect(ship.registerHit('00')).toBe(true);
    expect(ship.registerHit('01')).toBe(true);
    expect(ship.registerHit('02')).toBe(true);

    expect(ship.isSunk()).toBe(true);
  });

  test('registerHit ignores invalid or duplicate hits', () => {
    const ship = new Ship(2, ['11', '12']);

    expect(ship.registerHit('22')).toBe(false); // miss
    expect(ship.registerHit('11')).toBe(true);  // hit
    expect(ship.registerHit('11')).toBe(false); // duplicate
  });
}); 