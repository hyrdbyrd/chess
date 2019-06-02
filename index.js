const { CONSTANTS: { START_CHESS_BOARD, TYPES, CHESS_FIGURES, COLORS } } = window;

const width = 512;

const score = { [COLORS.WHITE]: 0, [COLORS.BLACK]: 0 };

const imgElem = new Image(1800, 800);
imgElem.src = 'chess.png';

const player = { focus: false, pos: [0, 0] };

imgElem.onload = () => {
    const chessElem = document.querySelector('.chess');

    if (chessElem === null) return;

    chessElem.style.width = `${width}px`;
    chessElem.style.height = `${width}px`;

    const ctx = chessElem.getContext('2d');

    const chessBoard = START_CHESS_BOARD.map(row => row.map(e => ({...e})));

    const getChessFrom = (x, y) => chessBoard[y]
        ? chessBoard[y][x]
            ? chessBoard[y][x]
            : null
        : null;

    // Grid block width
    const gw = width / 16;

    // 9 / 16 - 16x9 screen scale
    ctx.scale(1, 9 / 16);

    const clearItems = () => {
        chessBoard.forEach(row => {
           row.forEach(item => {
               item.canGo = false;
               item.canNot = false;
              item.attacked = false;
           });
        });
    };

    const paint = () => {
        ctx.clearRect(0, 0, width, width);

        chessBoard.forEach((row, y) => {
            row.forEach(({ imgPos, canGo, attacked, type, canNot }, x) => {
                const { focus, pos: [px, py] } = player;

                const hasFigure = type !== TYPES.EMPTY;

                if (focus && px === x && py === y && hasFigure) ctx.fillStyle = COLORS.FOCUS;
                else ctx.fillStyle = (x + y) % 2 ? COLORS.BLACK : COLORS.WHITE;

                if (canGo) ctx.fillStyle = COLORS.CAN_GO;
                if (canNot) ctx.fillStyle = COLORS.CAN_NOT;
                if (attacked) ctx.fillStyle = COLORS.ATTACK;

                const rectOpts = [x * gw, y * gw, gw, gw];
                ctx.fillRect(...rectOpts);

                if (!Array.isArray(imgPos) || !hasFigure) return;

                const imgOpts = [imgPos[0], imgPos[1], 300, 300];
                ctx.drawImage(...[imgElem].concat(imgOpts, rectOpts));
            });
        });
    };

    const forhead = (colorPlayer, x, y) => {
        const enemy = getChessFrom(x, y);
        if (enemy === null) return;

        const { type, color: colorEnemy } = enemy;

        if (colorPlayer === colorEnemy) {
            enemy.canNot = true;
            return;
        }

        switch (type) {
            case TYPES.EMPTY: {
                enemy.canGo = true;
                break;
            }
            case TYPES.HORSE:
            case TYPES.QUEEN:
            case TYPES.BISHOP:
            case TYPES.KING:
            case TYPES.PAWN:
            case TYPES.ROOK: {
                enemy.attacked = true;
                return;
            }
        }
    };

    const doMagic = () => {
        const [x, y] = player.pos;
        const [px, py] = player.prevPos;

        const { type, color, canGo, attacked, moved } = chessBoard[y][x];

        if (attacked || canGo) {
            if (attacked) {
                const { cost, color } = chessBoard[y][x];

                score[color] += cost;
                console.log(score);
            }

            chessBoard[y][x] = { ...chessBoard[py][px] };
            chessBoard[py][px] = { ...CHESS_FIGURES.e };

            chessBoard[y][x].moved = true;
        }

        clearItems();

        switch (type) {
            case TYPES.HORSE: {
                forhead(color, x - 2, y - 1);
                forhead(color, x - 2, y + 1);
                forhead(color, x + 2, y - 1);
                forhead(color, x + 2, y + 1);
                forhead(color, x - 1, y + 2);
                forhead(color, x - 1, y - 2);
                forhead(color, x + 1, y - 2);
                forhead(color, x + 1, y + 2);

                return;
            }
            case TYPES.PAWN: {
                const vec = color === COLORS.WHITE ? -1 : 1;

                forhead(color, x, y + vec);

                if (!moved) {
                    forhead(color, x, y + 2 * vec);

                    const di1 = getChessFrom(x + 1, y + 2 * vec);
                    const di2 = getChessFrom(x - 1, y + 2 * vec);
                }

                const di1 = getChessFrom(x + 1, y + vec);
                const di2 = getChessFrom(x - 1, y + vec);

                if (di1 && di1.type !== TYPES.EMPTY && di1.color !== color) {
                     forhead(color, x + 1, y + vec);
                }

                if (di2 && di2.type !== TYPES.EMPTY && di2.color !== color) {
                    forhead(color, x - 1, y + vec);
                }
            }
        }
    };

    // Focus imitation
    document.addEventListener('click', event => {
        if (event.target === chessElem) {
            player.focus = true;

            player.prevPos = player.pos;

            // ATTENTION: Magic numbers
            player.pos = [
                (event.x - chessElem.offsetLeft) / gw / 1.71 | 0,
                (event.y - chessElem.offsetTop) / gw / 1.9 | 0
            ];

            doMagic();
            paint();
        } else player.focus = false;
    });

    paint();
};