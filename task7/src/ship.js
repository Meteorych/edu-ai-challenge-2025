class Ship {
  /**
   * Creates a new Ship instance.
   * @param {number} length - The length of the ship (number of cells it occupies).
   * @param {Array<string>} locations - Array of location strings (e.g. '34') where the ship is placed.
   */
  constructor(length, locations = []) {
    this.length = length;
    // We store coordinates as strings "rc" to remain compatible with CLI input
    this.locations = locations;
    this.hits = Array(length).fill('');
  }

  /**
   * Registers a hit on the ship, if the coordinate matches one of its locations.
   * @param {string} coordinate - Location string in the form "rc" (e.g. "34").
   * @returns {boolean} True if this ship was hit by the attack.
   */
  registerHit(coordinate) {
    const idx = this.locations.indexOf(coordinate);
    if (idx !== -1 && this.hits[idx] !== 'hit') {
      this.hits[idx] = 'hit';
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship has been sunk (all segments hit).
   * @returns {boolean}
   */
  isSunk() {
    return this.hits.every(h => h === 'hit');
  }
}

export default Ship; 