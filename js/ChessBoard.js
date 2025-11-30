// ChessBoard.js - Represents the chess board state

class ChessBoard {
    constructor() {
        this.squares = Array(8).fill(null).map(() => Array(8).fill(null));
        this.enPassantTarget = null; // [row, col] of en passant target square
        this.initializeBoard();
    }

    // Set up initial chess position
    initializeBoard() {
        // Pawns
        for (let col = 0; col < 8; col++) {
            this.squares[1][col] = new ChessPiece('pawn', 'black', 1, col);
            this.squares[6][col] = new ChessPiece('pawn', 'white', 6, col);
        }

        // Rooks
        this.squares[0][0] = new ChessPiece('rook', 'black', 0, 0);
        this.squares[0][7] = new ChessPiece('rook', 'black', 0, 7);
        this.squares[7][0] = new ChessPiece('rook', 'white', 7, 0);
        this.squares[7][7] = new ChessPiece('rook', 'white', 7, 7);

        // Knights
        this.squares[0][1] = new ChessPiece('knight', 'black', 0, 1);
        this.squares[0][6] = new ChessPiece('knight', 'black', 0, 6);
        this.squares[7][1] = new ChessPiece('knight', 'white', 7, 1);
        this.squares[7][6] = new ChessPiece('knight', 'white', 7, 6);

        // Bishops
        this.squares[0][2] = new ChessPiece('bishop', 'black', 0, 2);
        this.squares[0][5] = new ChessPiece('bishop', 'black', 0, 5);
        this.squares[7][2] = new ChessPiece('bishop', 'white', 7, 2);
        this.squares[7][5] = new ChessPiece('bishop', 'white', 7, 5);

        // Queens
        this.squares[0][3] = new ChessPiece('queen', 'black', 0, 3);
        this.squares[7][3] = new ChessPiece('queen', 'white', 7, 3);

        // Kings
        this.squares[0][4] = new ChessPiece('king', 'black', 0, 4);
        this.squares[7][4] = new ChessPiece('king', 'white', 7, 4);
    }

    // Check if coordinates are valid
    isValid(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Get piece at position
    getPiece(row, col) {
        if (!this.isValid(row, col)) return null;
        return this.squares[row][col];
    }

    // Set piece at position
    setPiece(row, col, piece) {
        if (!this.isValid(row, col)) return;
        this.squares[row][col] = piece;
        if (piece) {
            piece.row = row;
            piece.col = col;
        }
    }

    // Remove piece at position
    removePiece(row, col) {
        const piece = this.getPiece(row, col);
        this.setPiece(row, col, null);
        return piece;
    }

    // Move piece from one position to another
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.removePiece(fromRow, fromCol);
        const capturedPiece = this.removePiece(toRow, toCol);
        this.setPiece(toRow, toCol, piece);
        if (piece) {
            piece.hasMoved = true;
        }
        return capturedPiece;
    }

    // Find king of given color
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Get all pieces of a given color
    getPieces(color) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }

    // Clone the board
    clone() {
        const newBoard = new ChessBoard();
        newBoard.squares = Array(8).fill(null).map(() => Array(8).fill(null));

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece) {
                    newBoard.squares[row][col] = piece.clone();
                }
            }
        }

        newBoard.enPassantTarget = this.enPassantTarget ? [...this.enPassantTarget] : null;
        return newBoard;
    }

    // Calculate material advantage
    getMaterialScore(color) {
        let score = 0;
        const pieces = this.getPieces(color);
        for (let piece of pieces) {
            score += piece.getValue();
        }
        return score;
    }

    // Reset board to initial position
    reset() {
        this.squares = Array(8).fill(null).map(() => Array(8).fill(null));
        this.enPassantTarget = null;
        this.initializeBoard();
    }
}
