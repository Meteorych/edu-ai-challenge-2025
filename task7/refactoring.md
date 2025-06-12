# Refactoring Summary

This document explains **what** was changed in the legacy `seabattle.js` implementation and **why** these changes improve quality, maintainability and testability.

## 1. Language & Tooling Upgrades

* **ES6+ Syntax** – The code now uses `class`, `const`/`let`, template literals and arrow functions.
* **Modules** – Logic is split across CommonJS modules placed inside `src/`.
* **Package Management** – Added `package.json` with `start`, `test` scripts and Jest dev-dependency.
* **Unit Testing** – Introduced Jest plus a test suite with >60 % coverage.

## 2. Architecture & Separation of Concerns

| Component | Responsibility |
|-----------|----------------|
| `Ship`    | Holds positions & hit status, decides when sunk |
| `Board`   | Grid state, random ship placement, attack resolution |
| `Player`  | Owns a `Board` and fleet, handles received attacks |
| `CPUPlayer` | Extends `Player`; provides hunt/target shooting strategy |
| `Game`    | High-level orchestration & CLI view (I/O only) |

This modular structure eliminates the large collection of **global variables** that previously coupled state. Each object now encapsulates its own data.

## 3. Readability & Maintainability

* Meaningful names (`receiveAttack`, `chooseAttackCoordinate`) and JSDoc comments.
* No magic numbers – board size and fleet setup are configurable through `Game` options.
* Board printing is performed by a dedicated method, keeping UI logic out of core models.
* Each class has a clear public API which simplifies future extension and testing.

## 4. Testability

* Because logic is isolated from I/O, unit tests can directly exercise `Ship`, `Board` and `CPUPlayer` without touching the CLI.
* Jest coverage easily demonstrates the health of the codebase (see `test_report.txt`).

## 5. Result

The refactored application delivers the **exact same gameplay mechanics** while dramatically improving code quality and providing a testing foundation for future work.
