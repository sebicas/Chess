// ChessPiece.js - Defines chess pieces and their movement patterns

class ChessPiece {
    constructor(type, color, row, col) {
        this.type = type; // 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
        this.color = color; // 'white' or 'black'
        this.row = row;
        this.col = col;
        this.hasMoved = false; // For castling and pawn double-move
    }

    // Get Unicode symbol for the piece
    getSymbol() {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[this.color][this.type];
    }

    // Get material value for evaluation
    getValue() {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0 // King has no value in material count
        };
        return values[this.type];
    }

    // Clone this piece
    clone() {
        const piece = new ChessPiece(this.type, this.color, this.row, this.col);
        piece.hasMoved = this.hasMoved;
        return piece;
    }

    // Generate possible moves (without checking for check)
    getPossibleMoves(board) {
        const moves = [];
        
        switch(this.type) {
            case 'pawn':
                moves.push(...this.getPawnMoves(board));
                break;
            case 'rook':
                moves.push(...this.getRookMoves(board));
                break;
            case 'knight':
                moves.push(...this.getKnightMoves(board));
                break;
            case 'bishop':
                moves.push(...this.getBishopMoves(board));
                break;
            case 'queen':
                moves.push(...this.getQueenMoves(board));
                break;
            case 'king':
                moves.push(...this.getKingMoves(board));
                break;
        }
        
        return moves;
    }

    getPawnMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Forward move
        const newRow = this.row + direction;
        if (board.isValid(newRow, this.col) && !board.getPiece(newRow, this.col)) {
            moves.push({ row: newRow, col: this.col, type: 'move' });

            // Double move from start
            if (this.row === startRow) {
                const doubleRow = this.row + (direction * 2);
                if (!board.getPiece(doubleRow, this.col)) {
                    moves.push({ row: doubleRow, col: this.col, type: 'move', isDoubleMove: true });
                }
            }
        }

        // Captures
        for (let colOffset of [-1, 1]) {
            const captureCol = this.col + colOffset;
            if (board.isValid(newRow, captureCol)) {
                const targetPiece = board.getPiece(newRow, captureCol);
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: captureCol, type: 'capture' });
                }
            }
        }

        // En passant
        if (board.enPassantTarget) {
            const [epRow, epCol] = board.enPassantTarget;
            if (newRow === epRow && Math.abs(this.col - epCol) === 1) {
                moves.push({ row: epRow, col: epCol, type: 'enpassant' });
            }
        }

        return moves;
    }

    getRookMoves(board) {
        return this.getSlidingMoves(board, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }

    getBishopMoves(board) {
        return this.getSlidingMoves(board, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getQueenMoves(board) {
        return this.getSlidingMoves(board, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getSlidingMoves(board, directions) {
        const moves = [];

        for (let [dRow, dCol] of directions) {
            let row = this.row + dRow;
            let col = this.col + dCol;

            while (board.isValid(row, col)) {
                const targetPiece = board.getPiece(row, col);
                
                if (!targetPiece) {
                    moves.push({ row, col, type: 'move' });
                } else {
                    if (targetPiece.color !== this.color) {
                        moves.push({ row, col, type: 'capture' });
                    }
                    break;
                }

                row += dRow;
                col += dCol;
            }
        }

        return moves;
    }

    getKnightMoves(board) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (let [dRow, dCol] of offsets) {
            const row = this.row + dRow;
            const col = this.col + dCol;

            if (board.isValid(row, col)) {
                const targetPiece = board.getPiece(row, col);
                if (!targetPiece) {
                    moves.push({ row, col, type: 'move' });
                } else if (targetPiece.color !== this.color) {
                    moves.push({ row, col, type: 'capture' });
                }
            }
        }

        return moves;
    }

    getKingMoves(board) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dRow, dCol] of offsets) {
            const row = this.row + dRow;
            const col = this.col + dCol;

            if (board.isValid(row, col)) {
                const targetPiece = board.getPiece(row, col);
                if (!targetPiece) {
                    moves.push({ row, col, type: 'move' });
                } else if (targetPiece.color !== this.color) {
                    moves.push({ row, col, type: 'capture' });
                }
            }
        }

        // Castling (will be validated by GameLogic)
        if (!this.hasMoved) {
            moves.push({ row: this.row, col: this.col + 2, type: 'castle-kingside' });
            moves.push({ row: this.row, col: this.col - 2, type: 'castle-queenside' });
        }

        return moves;
    }
}
