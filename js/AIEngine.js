// AIEngine.js - Chess AI with multiple difficulty levels

class AIEngine {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = {
            easy: 1,
            medium: 2,
            hard: 4
        };
    }

    // Get the best move for the AI
    getBestMove(gameLogic) {
        const color = gameLogic.currentTurn;

        switch (this.difficulty) {
            case 'easy':
                return this.getEasyMove(gameLogic, color);
            case 'medium':
                return this.getMediumMove(gameLogic, color);
            case 'hard':
                return this.getHardMove(gameLogic, color);
            default:
                return this.getMediumMove(gameLogic, color);
        }
    }

    // Easy mode: 1 move lookahead with material evaluation
    getEasyMove(gameLogic, color) {
        const allMoves = gameLogic.getAllLegalMoves(color);
        if (allMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (let move of allMoves) {
            // Simulate move
            const testLogic = this.cloneGameLogic(gameLogic);
            testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);

            // Evaluate position
            const score = this.evaluatePosition(testLogic.board, color);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Medium mode: 2-3 moves lookahead with minimax
    getMediumMove(gameLogic, color) {
        const depth = this.getRandomDepth(2, 3);
        const allMoves = gameLogic.getAllLegalMoves(color);
        if (allMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (let move of allMoves) {
            const testLogic = this.cloneGameLogic(gameLogic);
            testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);

            const score = this.minimax(testLogic, depth - 1, false, color);

            // Add randomness for variability
            const randomFactor = (Math.random() - 0.5) * 0.5;
            const adjustedScore = score + randomFactor;

            if (adjustedScore > bestScore) {
                bestScore = adjustedScore;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Hard mode: 4-5 moves lookahead with alpha-beta pruning
    getHardMove(gameLogic, color) {
        const depth = this.getRandomDepth(4, 5);
        const allMoves = gameLogic.getAllLegalMoves(color);
        if (allMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (let move of allMoves) {
            const testLogic = this.cloneGameLogic(gameLogic);
            testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);

            const score = this.alphabeta(testLogic, depth - 1, -Infinity, Infinity, false, color);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Simple minimax without pruning
    minimax(gameLogic, depth, isMaximizing, aiColor) {
        if (depth === 0 || gameLogic.gameOver) {
            return this.evaluatePosition(gameLogic.board, aiColor);
        }

        const currentColor = gameLogic.currentTurn;
        const allMoves = gameLogic.getAllLegalMoves(currentColor);

        if (allMoves.length === 0) {
            return this.evaluatePosition(gameLogic.board, aiColor);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let move of allMoves) {
                const testLogic = this.cloneGameLogic(gameLogic);
                testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.minimax(testLogic, depth - 1, false, aiColor);
                maxScore = Math.max(maxScore, score);
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let move of allMoves) {
                const testLogic = this.cloneGameLogic(gameLogic);
                testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.minimax(testLogic, depth - 1, true, aiColor);
                minScore = Math.min(minScore, score);
            }
            return minScore;
        }
    }

    // Minimax with alpha-beta pruning
    alphabeta(gameLogic, depth, alpha, beta, isMaximizing, aiColor) {
        if (depth === 0 || gameLogic.gameOver) {
            return this.evaluatePositionAdvanced(gameLogic.board, aiColor);
        }

        const currentColor = gameLogic.currentTurn;
        const allMoves = gameLogic.getAllLegalMoves(currentColor);

        if (allMoves.length === 0) {
            return this.evaluatePositionAdvanced(gameLogic.board, aiColor);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let move of allMoves) {
                const testLogic = this.cloneGameLogic(gameLogic);
                testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.alphabeta(testLogic, depth - 1, alpha, beta, false, aiColor);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let move of allMoves) {
                const testLogic = this.cloneGameLogic(gameLogic);
                testLogic.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.alphabeta(testLogic, depth - 1, alpha, beta, true, aiColor);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }
            return minScore;
        }
    }

    // Basic position evaluation (material only)
    evaluatePosition(board, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        const myScore = board.getMaterialScore(color);
        const opponentScore = board.getMaterialScore(opponentColor);
        return myScore - opponentScore;
    }

    // Advanced position evaluation with piece-square tables and heuristics
    evaluatePositionAdvanced(board, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';

        // Material score
        let score = board.getMaterialScore(color) - board.getMaterialScore(opponentColor);

        // Positional bonuses
        const myPieces = board.getPieces(color);
        const opponentPieces = board.getPieces(opponentColor);

        for (let piece of myPieces) {
            score += this.getPieceSquareValue(piece) / 10;
        }

        for (let piece of opponentPieces) {
            score -= this.getPieceSquareValue(piece) / 10;
        }

        // Mobility bonus
        const myMobility = myPieces.reduce((sum, piece) => {
            return sum + piece.getPossibleMoves(board).length;
        }, 0);

        const opponentMobility = opponentPieces.reduce((sum, piece) => {
            return sum + piece.getPossibleMoves(board).length;
        }, 0);

        score += (myMobility - opponentMobility) * 0.1;

        // Center control bonus
        for (let piece of myPieces) {
            if (piece.row >= 3 && piece.row <= 4 && piece.col >= 3 && piece.col <= 4) {
                score += 0.3;
            }
        }

        for (let piece of opponentPieces) {
            if (piece.row >= 3 && piece.row <= 4 && piece.col >= 3 && piece.col <= 4) {
                score -= 0.3;
            }
        }

        return score;
    }

    // Get piece-square table value (simplified)
    getPieceSquareValue(piece) {
        const centerDistance = Math.abs(3.5 - piece.row) + Math.abs(3.5 - piece.col);

        if (piece.type === 'knight' || piece.type === 'bishop') {
            return -centerDistance * 0.1; // Knights and bishops prefer center
        } else if (piece.type === 'pawn') {
            // Pawns prefer advancing
            const advancement = piece.color === 'white' ? (7 - piece.row) : piece.row;
            return advancement * 0.05;
        } else if (piece.type === 'king') {
            // King stays safe in opening/middlegame
            return centerDistance * 0.1;
        }

        return 0;
    }

    // Clone game logic for simulation
    cloneGameLogic(gameLogic) {
        const newLogic = new GameLogic();
        newLogic.board = gameLogic.board.clone();
        newLogic.currentTurn = gameLogic.currentTurn;
        newLogic.gameOver = gameLogic.gameOver;
        newLogic.winner = gameLogic.winner;
        return newLogic;
    }

    // Get random depth in range
    getRandomDepth(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
