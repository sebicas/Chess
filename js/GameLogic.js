// GameLogic.js - Core chess rules and game state management

class GameLogic {
    constructor() {
        this.board = new ChessBoard();
        this.currentTurn = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.winner = null;
    }

    // Get all legal moves for a piece
    getLegalMoves(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) {
            return [];
        }

        const possibleMoves = piece.getPossibleMoves(this.board);
        const legalMoves = [];

        for (let move of possibleMoves) {
            if (this.isMoveLegal(row, col, move.row, move.col)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    // Check if a move is legal (doesn't leave king in check)
    isMoveLegal(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece) return false;

        // Special validation for castling
        if (piece.type === 'king') {
            const colDiff = toCol - fromCol;
            if (Math.abs(colDiff) === 2) {
                return this.canCastle(piece.color, colDiff > 0 ? 'kingside' : 'queenside');
            }
        }

        // Simulate the move
        const testBoard = this.board.clone();
        const testPiece = testBoard.getPiece(fromRow, fromCol);

        // Handle en passant capture
        const move = testPiece.getPossibleMoves(testBoard).find(
            m => m.row === toRow && m.col === toCol
        );

        if (move && move.type === 'enpassant') {
            const captureRow = fromRow; // Pawn is on same row
            testBoard.removePiece(captureRow, toCol);
        }

        testBoard.movePiece(fromRow, fromCol, toRow, toCol);

        // Check if king is in check after the move
        return !this.isKingInCheck(testBoard, piece.color);
    }

    // Check if a king is in check
    isKingInCheck(board, color) {
        const kingPos = board.findKing(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = board.getPieces(opponentColor);

        for (let piece of opponentPieces) {
            const moves = piece.getPossibleMoves(board);
            for (let move of moves) {
                if (move.row === kingPos.row && move.col === kingPos.col) {
                    return true;
                }
            }
        }

        return false;
    }

    // Check if castling is allowed
    canCastle(color, side) {
        const row = color === 'white' ? 7 : 0;
        const king = this.board.getPiece(row, 4);

        if (!king || king.type !== 'king' || king.hasMoved) {
            return false;
        }

        if (this.isKingInCheck(this.board, color)) {
            return false; // Can't castle out of check
        }

        if (side === 'kingside') {
            const rook = this.board.getPiece(row, 7);
            if (!rook || rook.type !== 'rook' || rook.hasMoved) {
                return false;
            }

            // Check if squares are empty
            if (this.board.getPiece(row, 5) || this.board.getPiece(row, 6)) {
                return false;
            }

            // Check if king passes through or lands on attacked square
            for (let col of [5, 6]) {
                const testBoard = this.board.clone();
                testBoard.movePiece(row, 4, row, col);
                if (this.isKingInCheck(testBoard, color)) {
                    return false;
                }
            }

            return true;
        } else { // queenside
            const rook = this.board.getPiece(row, 0);
            if (!rook || rook.type !== 'rook' || rook.hasMoved) {
                return false;
            }

            // Check if squares are empty
            if (this.board.getPiece(row, 1) || this.board.getPiece(row, 2) || this.board.getPiece(row, 3)) {
                return false;
            }

            // Check if king passes through or lands on attacked square
            for (let col of [2, 3]) {
                const testBoard = this.board.clone();
                testBoard.movePiece(row, 4, row, col);
                if (this.isKingInCheck(testBoard, color)) {
                    return false;
                }
            }

            return true;
        }
    }

    // Execute a move
    makeMove(fromRow, fromCol, toRow, toCol) {
        if (this.gameOver) return false;

        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece || piece.color !== this.currentTurn) {
            return false;
        }

        if (!this.isMoveLegal(fromRow, fromCol, toRow, toCol)) {
            return false;
        }

        // Handle special moves
        let capturedPiece = null;
        let moveType = 'normal';
        let promotion = false;

        // Check for castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            moveType = 'castle';
            const isKingside = toCol > fromCol;
            const rookCol = isKingside ? 7 : 0;
            const newRookCol = isKingside ? 5 : 3;
            this.board.movePiece(fromRow, rookCol, toRow, newRookCol);
        }

        // Check for en passant
        const possibleMove = piece.getPossibleMoves(this.board).find(
            m => m.row === toRow && m.col === toCol
        );

        if (possibleMove && possibleMove.type === 'enpassant') {
            moveType = 'enpassant';
            capturedPiece = this.board.removePiece(fromRow, toCol);
            if (capturedPiece) {
                this.capturedPieces[piece.color].push(capturedPiece);
            }
        }

        // Execute the move
        const captured = this.board.movePiece(fromRow, fromCol, toRow, toCol);
        if (captured && moveType !== 'enpassant') {
            capturedPiece = captured;
            this.capturedPieces[piece.color].push(captured);
        }

        // Update en passant target
        this.board.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            const epRow = (fromRow + toRow) / 2;
            this.board.enPassantTarget = [epRow, toCol];
        }

        // Handle pawn promotion
        if (piece.type === 'pawn') {
            if ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7)) {
                // Auto-promote to queen
                this.board.setPiece(toRow, toCol, new ChessPiece('queen', piece.color, toRow, toCol));
                this.board.getPiece(toRow, toCol).hasMoved = true;
                promotion = true;
                moveType = 'promotion';
            }
        }

        // Record move
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            color: piece.color,
            captured: capturedPiece ? capturedPiece.type : null,
            moveType: moveType,
            promotion: promotion
        });

        // Switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

        // Check game end conditions
        this.checkGameEnd();

        return true;
    }

    // Check if the game has ended
    checkGameEnd() {
        const hasLegalMoves = this.hasAnyLegalMoves(this.currentTurn);

        if (!hasLegalMoves) {
            const inCheck = this.isKingInCheck(this.board, this.currentTurn);
            this.gameOver = true;

            if (inCheck) {
                // Checkmate
                this.winner = this.currentTurn === 'white' ? 'black' : 'white';
            } else {
                // Stalemate
                this.winner = 'draw';
            }
        }
    }

    // Check if a player has any legal moves
    hasAnyLegalMoves(color) {
        const pieces = this.board.getPieces(color);

        for (let piece of pieces) {
            const legalMoves = this.getLegalMoves(piece.row, piece.col);
            if (legalMoves.length > 0) {
                return true;
            }
        }

        return false;
    }

    // Get all legal moves for all pieces of a color
    getAllLegalMoves(color) {
        const allMoves = [];
        const pieces = this.board.getPieces(color);

        for (let piece of pieces) {
            const legalMoves = this.getLegalMoves(piece.row, piece.col);
            for (let move of legalMoves) {
                allMoves.push({
                    from: { row: piece.row, col: piece.col },
                    to: { row: move.row, col: move.col },
                    piece: piece
                });
            }
        }

        return allMoves;
    }

    // Undo last move
    undoMove() {
        if (this.moveHistory.length === 0) return false;

        // For simplicity, we'll reset the board and replay all moves except the last one
        const history = [...this.moveHistory];
        history.pop(); // Remove last move

        this.reset();

        for (let move of history) {
            this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
        }

        return true;
    }

    // Reset game
    reset() {
        this.board.reset();
        this.currentTurn = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.winner = null;
    }

    // Get move in algebraic notation
    getMoveNotation(move) {
        const pieceSymbols = {
            king: 'K',
            queen: 'Q',
            rook: 'R',
            bishop: 'B',
            knight: 'N',
            pawn: ''
        };

        const files = 'abcdefgh';
        const ranks = '87654321';

        let notation = '';

        if (move.moveType === 'castle') {
            notation = move.to.col > move.from.col ? 'O-O' : 'O-O-O';
        } else {
            notation += pieceSymbols[move.piece];

            if (move.captured) {
                if (move.piece === 'pawn') {
                    notation += files[move.from.col];
                }
                notation += 'x';
            }

            notation += files[move.to.col] + ranks[move.to.row];

            if (move.promotion) {
                notation += '=Q';
            }
        }

        return notation;
    }
}
