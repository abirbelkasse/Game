const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);

let score = 0;

function areaSweep() {
    let rowCount = 1;
    outer: for(let y = area.length - 1; y > 0; --y) {
        for(let x = 0 ; x < area[y].length; ++x) {
            if(area[y][x] === 0) {
                continue outer;
            }
        }

        const row = area.splice(y, 1)[0].fill(0);
        area.unshift(row);
        ++y;

        score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(area, piece) {
    const [m, o] = [piece.matrix, piece.pos];
    for(let y = 0 ; y < m.length; ++y) {
        for(let x = 0 ; x < m[y].length ; ++x) {
            if(m[y][x] !== 0 && (area[y + o.y] && area[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }

    return false;
}

function createPiece(type) {
    if(type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if(type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function createMatrix(w,h) {
    const matrix = [];
    while(h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(area, {x:0, y:0});
    drawMatrix(piece.matrix, piece.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1 , 1);
            }
        });
    });
}

function merge(area, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                area[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    });
}

const piece = {
    pos: {x:0, y:0},
    matrix: null
}

function pieceReset() {
    const pieces = 'ILJOTSZ';
    piece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    piece.pos.y = 0;
    piece.pos.x = (area[0].length / 2 | 0) - (piece.matrix[0].length / 2 | 0);

    if(collide(area, piece)) {
        area.forEach(row => row.fill(0));
        score = 0;
        updateScore();
    }
}

function pieceDrop() {
    piece.pos.y++;

    if(collide(area, piece)) {
        piece.pos.y--;
        merge(area, piece);
        pieceReset();
        areaSweep();
        updateScore();
    }

    dropCounter = 0;
}

function pieceMove(dir) {
    piece.pos.x += dir;
    if(collide(area,piece)) {
        piece.pos.x -= dir;
    }
}

function pieceRotate(dir) {
    let offset = 1;
    rotate(piece.matrix, dir);
    while(collide(area, piece)) {
        piece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : - 1));

        if(offset > piece.matrix[0].length) {
            rotate(piece.matrix, -dir);
            piece.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0 ; y <  matrix.length ; ++y) {
        for (let x = 0 ; x < y ; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if(dir > 0) {
        matrix.forEach(row => row.reverse());
    }  else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter >= dropInterval) {
        pieceDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

const area = createMatrix(12,20);

const colors = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'aqua',
    'green',
    'red'
  ];

document.addEventListener('keydown', event => {
    if(event.keyCode === 37) {
        pieceMove(-1);
    } else if (event.keyCode === 39) {
        pieceMove(1);
    } else if (event.keyCode === 40) {
        pieceDrop();
    } else if(event.keyCode === 81) {
        pieceRotate(-1);
    } else if(event.keyCode === 70) {
        pieceRotate(1);
    }
});

pieceReset();
updateScore();
update();