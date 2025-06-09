const { Enigma } = require('./enigma');

describe('Enigma Machine', () => {
  it('should correctly encrypt AAAAA to BDZGO (Wikipedia reference test)', () => {
    // Rotors I, II, III (from left to right), Reflector B, AAA ring settings, AAA positions
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const plaintext = 'AAAAA';
    const expectedCiphertext = 'BDZGO';
    expect(enigma.process(plaintext)).toBe(expectedCiphertext);
  });

  it('should correctly encrypt and decrypt a message (reciprocity)', () => {
    const enigmaEncrypt = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const plaintext = 'HELLO';
    const ciphertext = enigmaEncrypt.process(plaintext);

    const enigmaDecrypt = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    expect(enigmaDecrypt.process(ciphertext)).toBe(plaintext);
  });

  it('should correctly encrypt and decrypt with plugboard settings', () => {
    const plugboardPairs = [['A', 'B'], ['C', 'D'], ['E', 'F']];
    const initialPositions = [5, 12, 21]; // F, M, V
    const ringSettings = [1, 2, 3];     // B, C, D
    const enigmaEncrypt = new Enigma([0, 1, 2], initialPositions, ringSettings, plugboardPairs);
    const plaintext = 'THISISATEST';
    const ciphertext = enigmaEncrypt.process(plaintext);

    const enigmaDecrypt = new Enigma([0, 1, 2], initialPositions, ringSettings, plugboardPairs);
    expect(enigmaDecrypt.process(ciphertext)).toBe(plaintext);
  });

  it('should handle characters not in the alphabet', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const plaintext = 'HELLO WORLD';
    const ciphertext = enigma.process(plaintext);
    
    // Should preserve spaces and only encrypt letters
    expect(ciphertext).toMatch(/^[A-Z ]+$/);
    expect(ciphertext.indexOf(' ')).toBe(5); // Space should be in same position
  });

  it('should produce different outputs for different initial positions', () => {
    const plaintext = 'HELLO';
    
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [1, 2, 3], [0, 0, 0], []);
    
    const result1 = enigma1.process(plaintext);
    const result2 = enigma2.process(plaintext);
    
    expect(result1).not.toBe(result2);
  });
}); 