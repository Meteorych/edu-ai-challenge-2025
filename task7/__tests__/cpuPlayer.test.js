import CPUPlayer from '../src/cpuPlayer.js';

describe('CPUPlayer logic', () => {
  test('CPU selects unique coordinates over multiple turns', () => {
    const cpu = new CPUPlayer();
    const attempts = 50;
    const coords = new Set();
    for (let i = 0; i < attempts; i++) {
      const coord = cpu.chooseAttackCoordinate();
      expect(coords.has(coord)).toBe(false);
      coords.add(coord);
      cpu.guesses.add(coord);
    }
  });

  test('CPU enters target mode after a hit and clears after sink', () => {
    const cpu = new CPUPlayer();
    // Fake scenario: board size 10
    const hitCoord = '44';
    cpu.handleAttackResult(hitCoord, { hit: true, sunk: false });
    expect(cpu.mode).toBe('target');
    expect(cpu.targetQueue.length).toBeGreaterThan(0);

    cpu.handleAttackResult('45', { hit: true, sunk: true });
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue.length).toBe(0);
  });
}); 