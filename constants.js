((exporter) => {
    const TYPES = {
        HORSE: 'horse',
        KING: 'king',
        QUEEN: 'queen',
        ROOK: 'rook',
        PAWN: 'pawn',
        BISHOP: 'bishop',
        EMPTY: 'empty'
    };

    const COLORS = {
        BLACK: 'brown',
        WHITE: 'white',
        FOCUS: 'blue',
        ATTACK: 'red',
        CAN_NOT: 'darkgray',
        CAN_GO: 'lightblue'
    };

    const CHESS_FIGURES = {
        h: { type: TYPES.HORSE,   imgPos: [1200], cost: 3   },
        k: { type: TYPES.KING,    imgPos: [900],  cost: 100 },
        q: { type: TYPES.QUEEN,   imgPos: [600],  cost: 6   },
        r: { type: TYPES.ROOK,    imgPos: [0],    cost: 4   },
        p: { type: TYPES.PAWN,    imgPos: [1500], cost: 1   },
        b: { type: TYPES.BISHOP,  imgPos: [300],  cost: 3   },
        e: { type: TYPES.EMPTY,                   cost: 0   }
    };

    // Create chess item
    const cci = (color) => ({ imgPos, type, cost }) => ({
        cost,
        type,
        color,
        moved: false,
        canGo: false,
        canNot: false,
        attacked: false,
        imgPos: [imgPos[0], color === COLORS.BLACK ? 0 : 400]
    });

    const dcci = cci(COLORS.BLACK);
    const lcci = cci(COLORS.WHITE);

    const { h, k, q, r, p, b, e } = CHESS_FIGURES;

    const START_CHESS_BOARD = [
        [dcci(r), dcci(h), dcci(b), dcci(q), dcci(k), dcci(b), dcci(h), dcci(r)],
        [dcci(p), dcci(p), dcci(p), dcci(p), dcci(p), dcci(p), dcci(p), dcci(p)],
        [e,       e,       e,       e,       e,       e,       e,       e      ],
        [e,       e,       e,       e,       e,       e,       e,       e      ],
        [e,       e,       e,       e,       e,       e,       e,       e      ],
        [e,       e,       e,       e,       e,       e,       e,       e      ],
        [lcci(p), lcci(p), lcci(p), lcci(p), lcci(p), lcci(p), lcci(p), lcci(p)],
        [lcci(r), lcci(h), lcci(b), lcci(q), lcci(k), lcci(b), lcci(h), lcci(r)],
    ].map(row => row.map(e => ({ ...e })));

    const getChessFrom = chessBoard => (x, y) => chessBoard[y]
        ? chessBoard[y][x]
            ? chessBoard[y][x]
            : null
        : null;

    const forhead = chessBoard => (colorPlayer, x, y, options = {}) => {
        const result = { toAttack: false, toGo: false, empty: false };

        const enemy = getChessFrom(chessBoard)(x, y);
        if (enemy === null) return result;

        const { canAttack = true, canGo = true } = options;

        const { type, color: colorEnemy } = enemy;

        if (colorPlayer === colorEnemy) {
            enemy.canNot = true;
            result.toAttack = true;
            return result;
        }

        switch (type) {
            case TYPES.EMPTY: {
                if (canGo) {
                    enemy.canGo = true;
                    result.toGo = true;
                }

                return result;
            }

            case TYPES.HORSE:
            case TYPES.QUEEN:
            case TYPES.BISHOP:
            case TYPES.KING:
            case TYPES.PAWN:
            case TYPES.ROOK: {
                if (canAttack) {
                    enemy.attacked = true;
                    result.toAttack = true;
                }

                return result;
            }

            default: return result;
        }
    };

    const diagonal = chessBoard => (color, x, y) => {
        const move = forhead(chessBoard);

        // actual x
        const ax = x;
        // actual y
        const ay = y;

        const dims = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        dims.forEach(([dirX, dirY]) => {
            let dx = ax;
            let dy = ay;

            while (chessBoard[dy] && chessBoard[dy][dx]) {
                dx += dirX;
                dy += dirY;

                if (move(color, dx, dy).toAttack) break;
            }
        });
    };

    const line = chessBoard => (color, x, y) => {
        const move = forhead(chessBoard);

        // actual x
        const ax = x;
        // actual y
        const ay = y;

        const dims = [[1,  0], [-1, 0], [0,  1], [0, -1]];
        dims.forEach(([dirX, dirY]) => {
            let dx = ax;
            let dy = ay;

            while (chessBoard[dy] && chessBoard[dy][dx]) {
                dx += dirX;
                dy += dirY;

                if (move(color, dx, dy).toAttack) break;
            }
        });
    };

    const MOVES = {
        diagonal,
        forhead,
        line
    };

    exporter.CONSTANTS = {
        TYPES,
        MOVES,
        COLORS,
        CHESS_FIGURES,
        START_CHESS_BOARD
    };
})(window);
