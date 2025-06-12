# Sea Battle (Modernized Battleship CLI)

A modern, fully-tested command-line implementation of the classic Battleship game.

## Features

* 10×10 grid with 3 × length-3 ships per side
* Turn-based gameplay against a CPU opponent that uses *hunt/target* strategy
* Clean ES6-class codebase with clear separation of concerns (Game, Board, Ship, Player, CPUPlayer)
* Automated unit tests (Jest) with >60 % coverage

## Requirements

* Node.js ≥ 14
* npm (ships with Node)

## Installation

```bash
npm install
```

## Running the Game

```bash
npm start
```

Follow the on-screen prompts and type two-digit coordinates (e.g. `34`, `07`).

## Running Tests & Generating Coverage Report

```bash
npm test
```

A textual coverage summary will be shown in the console and written to `coverage/`.

## Project Structure

```text
src/
  board.js        – Board logic (grid, ship placement, attacks)
  ship.js         – Ship entity
  player.js       – Human player wrapper
  cpuPlayer.js    – AI opponent with hunt/target strategy
  game.js         – Game orchestration + CLI view
  index.js        – CLI entry point
__tests__/
  *.test.js       – Jest unit tests
```

## License

MIT
