const { CONSTANTS: { START_CHESS_BOARD, TYPES, CHESS_FIGURES, COLORS, MOVES } } = window;

const width = 512;

const score = { [COLORS.WHITE]: 0, [COLORS.BLACK]: 0 };

const imgElem = new Image(1800, 800);
imgElem.src = 'chess.png';

const player = { focus: false, pos: [0, 0], turn: COLORS.WHITE };

imgElem.onload = () => {
    const chessElem = document.querySelector('.chess');

    if (chessElem === null) return;

    chessElem.style.width = `${width}px`;
    chessElem.style.height = `${width}px`;

    const ctx = chessElem.getContext('2d');

    const chessBoard = START_CHESS_BOARD.map(row => row.map(e => ({...e})));

    for (const key in MOVES) MOVES[key] = MOVES[key](chessBoard);
    const { diagonal, forhead, line } = MOVES;

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

    const handler = () => {
        const { pos, prevPos, turn } = player;
        const [x, y] = pos;
        const [px, py] = prevPos;

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

            clearItems();
            player.turn = turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            return;
        }

        clearItems();

        if (turn !== color) {
            return;
        }

        const move = forhead.bind(null, color);

        switch (type) {
            case TYPES.BISHOP: {
                diagonal(color, x, y);

                break;
            }
            case TYPES.ROOK: {
                line(color, x, y);

                break;
            }
            case TYPES.QUEEN: {
                diagonal(color, x, y);
                line(color, x, y);

                break;
            }
            case TYPES.HORSE: {
                move(x - 2, y - 1);
                move(x - 2, y + 1);
                move(x + 2, y - 1);
                move(x + 2, y + 1);
                move(x - 1, y + 2);
                move(x - 1, y - 2);
                move(x + 1, y - 2);
                move(x + 1, y + 2);

                break;
            }
            case TYPES.PAWN: {
                const vec = color === COLORS.WHITE ? -1 : 1;

                move(x, y + vec, { canAttack: false });
                if (!moved) {
                    move(x, y + 2 * vec, { canAttack: false });
                }

                move(x + 1, y + vec, { canGo: false });
                move(x - 1, y + vec, { canGo: false });

                break;
            }
            case TYPES.KING: {
                move(x, y - 1);
                move(x, y + 1);
                move(x - 1, y);
                move(x + 1, y);
                move(x + 1, y + 1);
                move(x + 1, y - 1);
                move(x - 1, y + 1);
                move(x - 1, y - 1);

                break;
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

            handler();
            paint();
        } else player.focus = false;
    });

    paint();
};