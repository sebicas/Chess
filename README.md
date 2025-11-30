# Chess Master

A feature-rich, interactive chess application built with modern web technologies. Play against an AI with adjustable difficulty levels or challenge a friend in local multiplayer mode.

## Features

- **Game Modes**:
  - **1 Player**: Challenge the AI with 3 difficulty levels:
    - **Easy**: 1 move lookahead (Material evaluation)
    - **Medium**: 2-3 moves lookahead (Minimax algorithm)
    - **Hard**: 4-5 moves lookahead (Alpha-beta pruning)
  - **2 Players**: Local multiplayer mode.
- **Game Mechanics**:
  - Complete move validation (including Castling, En Passant, Promotion).
  - Check, Checkmate, and Stalemate detection.
  - Move history tracking.
  - Captured pieces display.
  - Undo and Restart functionality.
- **UI/UX**:
  - Clean, responsive design.
  - Visual indicators for valid moves and last move.
  - Sound effects for moves, captures, and checks.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express (for serving the application)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone git@github.com:sebicas/Chess.git
    cd chess-master
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Usage

1.  **Start the server**:
    ```bash
    npm start
    ```

2.  **Open the application**:
    Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `index.html`: Main entry point.
- `server.js`: Express server setup.
- `js/`: Contains all JavaScript logic.
  - `main.js`: Application initialization and event listeners.
  - `Game.js`: Main game controller.
  - `ChessBoard.js`: Board representation and rendering.
  - `ChessPiece.js`: Piece definitions and movement logic.
  - `GameLogic.js`: Rules and validation.
  - `AIEngine.js`: AI logic (Minimax, Alpha-beta pruning).
  - `UI.js`: UI updates and interactions.
- `styles.css`: Application styling.
- `sounds/`: Audio assets.

## License

This project is licensed under the ISC License.
