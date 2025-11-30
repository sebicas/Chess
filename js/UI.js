// UI.js - User Interface controller

class UI {
    constructor(game) {
        this.game = game;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Home screen buttons
        document.getElementById('btn-1player').addEventListener('click', () => {
            this.showScreen('difficulty-screen');
        });

        document.getElementById('btn-2player').addEventListener('click', () => {
            this.game.startGame('2player');
            this.showScreen('game-screen');
        });

        // Difficulty selection buttons
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-difficulty').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Color selection buttons
        document.querySelectorAll('.btn-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-color').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Start game button
        document.getElementById('btn-start-game').addEventListener('click', () => {
            const selectedDifficulty = document.querySelector('.btn-difficulty.selected');
            const selectedColor = document.querySelector('.btn-color.selected');

            if (selectedDifficulty) {
                const difficulty = selectedDifficulty.dataset.difficulty;
                const color = selectedColor.dataset.color;
                this.game.startGame('1player', difficulty, color);
                this.showScreen('game-screen');
            }
        });

        // Back to home button
        document.getElementById('btn-back-home').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        // Game control buttons
        document.getElementById('btn-undo').addEventListener('click', () => {
            this.game.undoMove();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            if (confirm('Restart the game?')) {
                this.game.restartGame();
            }
        });

        document.getElementById('btn-quit').addEventListener('click', () => {
            if (confirm('Quit to home screen?')) {
                this.showScreen('home-screen');
            }
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        const board = this.game.logic.board;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = board.getPiece(row, col);
                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = 'piece-sprite';
                    pieceSpan.textContent = piece.getSymbol();
                    square.appendChild(pieceSpan);
                }

                // Highlight selected square
                if (this.selectedSquare &&
                    this.selectedSquare.row === row &&
                    this.selectedSquare.col === col) {
                    square.classList.add('selected');
                }

                // Highlight legal moves
                const isLegalMove = this.legalMoves.find(m => m.row === row && m.col === col);
                if (isLegalMove) {
                    if (isLegalMove.type === 'capture' || isLegalMove.type === 'enpassant') {
                        square.classList.add('legal-capture');
                    } else {
                        square.classList.add('legal-move');
                    }
                }

                // Highlight king in check
                if (piece && piece.type === 'king' &&
                    this.game.logic.isKingInCheck(board, piece.color) &&
                    piece.color === this.game.logic.currentTurn) {
                    square.classList.add('in-check');
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));

                boardElement.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.game.mode === '1player' && this.game.logic.currentTurn === this.game.aiColor) {
            return; // Don't allow clicks during AI turn
        }

        const piece = this.game.logic.board.getPiece(row, col);

        // If a square is selected and we click on a legal move
        if (this.selectedSquare) {
            const isLegalMove = this.legalMoves.find(m => m.row === row && m.col === col);

            if (isLegalMove) {
                this.game.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.selectedSquare = null;
                this.legalMoves = [];
                return;
            }
        }

        // Select a piece
        if (piece && piece.color === this.game.logic.currentTurn) {
            this.selectedSquare = { row, col };
            this.legalMoves = this.game.logic.getLegalMoves(row, col);
            this.renderBoard();
        } else {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.renderBoard();
        }
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('turn-indicator');
        const currentTurn = this.game.logic.currentTurn;
        turnIndicator.textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1) + ' to move';
    }

    updateGameStatus() {
        const statusElement = document.getElementById('game-status');

        if (this.game.logic.gameOver) {
            statusElement.classList.add('checkmate');
            if (this.game.logic.winner === 'draw') {
                statusElement.textContent = 'Stalemate - Draw!';
            } else {
                const winner = this.game.logic.winner.charAt(0).toUpperCase() + this.game.logic.winner.slice(1);
                statusElement.textContent = `Checkmate! ${winner} wins!`;
            }
        } else if (this.game.logic.isKingInCheck(this.game.logic.board, this.game.logic.currentTurn)) {
            statusElement.classList.add('check');
            statusElement.textContent = 'Check!';
        } else {
            statusElement.className = 'game-status';
            statusElement.textContent = '';
        }
    }

    updateCapturedPieces() {
        const capturedWhite = document.getElementById('captured-white');
        const capturedBlack = document.getElementById('captured-black');

        capturedWhite.innerHTML = '';
        capturedBlack.innerHTML = '';

        for (let piece of this.game.logic.capturedPieces.white) {
            const span = document.createElement('span');
            span.className = 'captured-piece';
            span.textContent = piece.getSymbol();
            capturedWhite.appendChild(span);
        }

        for (let piece of this.game.logic.capturedPieces.black) {
            const span = document.createElement('span');
            span.className = 'captured-piece';
            span.textContent = piece.getSymbol();
            capturedBlack.appendChild(span);
        }
    }

    updateMoveHistory() {
        const historyElement = document.getElementById('move-history');
        historyElement.innerHTML = '';

        const moves = this.game.logic.moveHistory;
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];

            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';

            let text = `${moveNumber}. ${this.game.logic.getMoveNotation(whiteMove)}`;
            if (blackMove) {
                text += ` ${this.game.logic.getMoveNotation(blackMove)}`;
            }

            moveEntry.textContent = text;
            historyElement.appendChild(moveEntry);
        }

        // Auto-scroll to bottom
        historyElement.scrollTop = historyElement.scrollHeight;
    }

    playSound(soundType) {
        const audio = document.getElementById(`audio-${soundType}`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    update() {
        this.renderBoard();
        this.updateTurnIndicator();
        this.updateGameStatus();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
}
