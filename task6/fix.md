# Enigma Machine Bug Fix Report

This document outlines the bugs found in the `enigma.js` implementation and the fixes applied.

## Bugs Found

Three primary bugs were identified that caused the Enigma machine simulation to produce incorrect results.

### 1. Incorrect Rotor Stepping Mechanism

The original `stepRotors` function did not correctly model the behavior of a real Enigma machine's rotor stepping, specifically the "double step" anomaly of the middle rotor. The original logic:

```javascript
stepRotors() {
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (this.rotors[1].atNotch()) this.rotors[0].step();
  this.rotors[2].step();
}
```

This checked the notch of the middle rotor *after* it might have been stepped by the fast rotor, which is incorrect. This resulted in an inaccurate stepping sequence that didn't properly implement the Wehrmacht Enigma's double-step mechanism.

### 2. Missing Final Plugboard Swap

The `encryptChar` function correctly performed the initial plugboard character swap before the signal entered the rotors. However, it was missing the reciprocal swap after the signal had passed back through the rotors and the reflector. The plugboard swap should be applied at both the beginning and the end of the process to maintain the Enigma's reciprocal encryption property.

### 3. Incorrect Rotor Position Calculation (The Critical Bug)

The most critical bug was in the `forward` and `backward` methods of the `Rotor` class. The original implementation incorrectly handled how rotor positions affect signal transformation:

**Original flawed logic:**

```javascript
forward(c) {
  const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
  return this.wiring[idx];
}
```

This was fundamentally wrong because it didn't account for how the rotor's physical rotation affects both the input and output contacts. According to the technical documentation, when a rotor is at position B, a signal arriving at the fixed contact A should enter the rotor at contact B (due to the rotation), and the output contact is also shifted by the rotor position.

## Fixes Implemented

### 1. Corrected `stepRotors` Logic

The `stepRotors` function was replaced with a new implementation that accurately reflects the Wehrmacht Enigma stepping behavior:

```javascript
stepRotors() {
  const r1 = this.rotors[0], r2 = this.rotors[1], r3 = this.rotors[2];

  const r2_at_notch = r2.atNotch();
  if (r2_at_notch) {
    r1.step();
  }
  const r3_at_notch = r3.atNotch();
  if (r3_at_notch || r2_at_notch) {
    r2.step();
  }
  r3.step();
}
```

Key improvements:
- The fast rotor always steps.
- The middle rotor steps if the fast rotor is at a notch OR if the middle rotor itself is at a notch (double-step).
- The slow rotor steps only when the middle rotor is at a notch.
- Notch conditions are evaluated *before* any rotors are moved.

### 2. Added Final `plugboardSwap`

A call to `plugboardSwap` was added at the end of the `encryptChar` function:

```javascript
return plugboardSwap(c, this.plugboardPairs);
```

This ensures that the entire encryption path is symmetrical, which is a fundamental property of the Enigma machine.

### 3. Corrected Rotor Position Calculations

The `forward` and `backward` methods were completely rewritten to properly handle rotor position offsets:

**Corrected forward method:**

```javascript
forward(c) {
  const inputIndex = alphabet.indexOf(c);
  const rotorInputIndex = mod(inputIndex + this.position - this.ringSetting, 26);
  const outputChar = this.wiring[rotorInputIndex];
  
  const outputIndex = alphabet.indexOf(outputChar);
  const adjustedOutputIndex = mod(outputIndex - this.position + this.ringSetting, 26);
  
  return alphabet[adjustedOutputIndex];
}
```

**Corrected backward method:**

```javascript
backward(c) {
  const inputIndex = alphabet.indexOf(c);
  const adjustedInputIndex = mod(inputIndex + this.position - this.ringSetting, 26);
  const inputChar = alphabet[adjustedInputIndex];
  
  const rotorOutputIndex = this.wiring.indexOf(inputChar);
  const finalOutputIndex = mod(rotorOutputIndex - this.position + this.ringSetting, 26);
  
  return alphabet[finalOutputIndex];
}
```

This implementation correctly models how:

- The rotor's position affects which contact the signal enters
- The rotor's wiring transforms the signal
- The rotor's position affects which contact the signal exits from

## Verification

The fixes were verified using the historical test case from Wikipedia: "With the rotors I, II and III (from left to right), wide B-reflector, all ring settings in A-position, and start position AAA, typing AAAAA will produce the encoded sequence BDZGO."

The corrected implementation now produces:

- **Input**: `AAAAA`
- **Output**: `BDZGO` ✅

All reciprocity tests also pass, confirming that the Enigma machine correctly encrypts and decrypts messages while maintaining the fundamental property that encryption and decryption use the same settings. 