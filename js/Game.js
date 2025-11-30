// Game.js - Main game controller

class Game {
    constructor() {
        this.logic = new GameLogic();
        this.ui = null;
        this.mode = null; // '1player' or '2player'
        this.difficulty = 'medium';
        this.playerColor = 'white';
        this.aiColor = 'black';
        this.ai = null;
        this.aiThinking = false;
    }

    init() {
        this.ui = new UI(this);
        this.ui.update();
    }

    startGame(mode, difficulty = 'medium', playerColor = 'white') {
        this.mode = mode;
        this.difficulty = difficulty;
        this.playerColor = playerColor;
        this.aiColor = playerColor === 'white' ? 'black' : 'white';

        this.logic.reset();

        if (mode === '1player') {
            this.ai = new AIEngine(difficulty);

            // If AI plays white, make first move
            if (this.aiColor === 'white') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }

        this.ui.update();
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.logic.board.getPiece(fromRow, fromCol);
        const targetPiece = this.logic.board.getPiece(toRow, toCol);

        const success = this.logic.makeMove(fromRow, fromCol, toRow, toCol);

        if (success) {
            // Play sound
            if (targetPiece || this.logic.moveHistory[this.logic.moveHistory.length - 1].moveType === 'enpassant') {
                this.ui.playSound('capture');
            } else {
                this.ui.playSound('move');
            }

            // Play check sound if applicable
            if (this.logic.isKingInCheck(this.logic.board, this.logic.currentTurn)) {
                setTimeout(() => this.ui.playSound('check'), 200);
            }

            this.ui.update();

            // If 1-player mode and now AI's turn, make AI move
            if (this.mode === '1player' && this.logic.currentTurn === this.aiColor && !this.logic.gameOver) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }

        return success;
    }

    makeAIMove() {
        if (this.aiThinking || this.logic.gameOver) return;

        this.aiThinking = true;

        // Show thinking state
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = 'AI is thinking...';

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const move = this.ai.getBestMove(this.logic);

            if (move) {
                this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            }

            this.aiThinking = false;
        }, 100);
    }

    undoMove() {
        if (this.logic.moveHistory.length === 0) return;

        if (this.mode === '1player') {
            // Undo two moves (player + AI)
            this.logic.undoMove();
            if (this.logic.moveHistory.length > 0) {
                this.logic.undoMove();
            }
        } else {
            // Undo one move
            this.logic.undoMove();
        }

        this.ui.selectedSquare = null;
        this.ui.legalMoves = [];
        this.ui.update();
    }

    restartGame() {
        if (this.mode) {
            this.startGame(this.mode, this.difficulty, this.playerColor);
        } else {
            this.logic.reset();
            this.ui.update();
        }
    }
}
