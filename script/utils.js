// global vars
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gametime = 0; // frames passed since init
let gameover = false;

let mouse = {
    x: 0,
    y: 0
};

let target = 0;
let turn = 0;
let enemyTurn = 0;
let rounds = 0;

let isEnemyTurn = false;
let enemyAttacking = false;

// function parent objects
let Cal = { // calculation object
    // vars
    fps: 60, // running fps
    fpsTimes: [], // fps calc asset
    // functions
    rng: (min, max) => Math.random() * (max - min + 1) + min, // returns random float between min / max
    rngBoolean: bias => this.rng(0, 1) >= bias ? true : false, // returns true or false based on bias

    radian: d => (d * Math.PI) / 180, // returns radian equivalent of inputted degree

    damage: (atk, bp, def) => atk * (bp / (bp + def)), // returns damage amount
    healing: bp => -bp * Cal.rng(0.75, 1.25), // returns healing amount

    level: { // levelling parent object -- probably unused in this demo but it's good for future reference
        hp: (hp, level) => hp + Math.floor((hp / 30) + 2) * level, // returns updated hp stat
        mana: (mana, level) => mana + Math.round((mana / 40) + 1) * level, // returns updated mana stat
        stat: (stat, level) => stat + Math.floor((stat / 25) + 1) * level // returns updated stat
    },

    frames() { // returns current game fps
        // read current time
        const now = performance.now();
        // remove times from longer than 1 second ago
        while (calc_fpsTimes[0] <= now - 1000) calc_fpsTimes.shift();
        // add current time and return the length of the array
        calc_fpsTimes.push(now);
        // return length of the array (fps)
        return calc_fpsTimes.length;
    },

    withinBoundary(x, y, w, h, e) {
        const withinX = (x <= e.x && e.x <= x + w ? true : false);
        const withinY = (y <= e.y && e.y <= y + h ? true : false);
        return (withinX && withinY);
    },

    changeTurn() {
        if (rounds > (enemies.length + characters.length - 2)) { // round change
            rounds = 0;
            turn = 0;
            enemyTurn = 0;
        }
        else rounds++;
        
        if (rounds < characters.length) { // character turn
            isEnemyTurn = false;
            enemyTurn = 0;

            gui.push(attackButton);
            text = [attackText()];

            if (turn === 0 && rounds !== 0) turn++;
            else turn = 0;
        } else { // enemy turn
            isEnemyTurn = true;
            turn = 0;

            text = [];

            if (enemyTurn === 0 && enemies.length !== 0) enemyTurn++; 
            else enemyTurn = 0;

            if (enemyTurn > enemies.length - 1) enemyTurn = 0;
        }
    },
    enemyturn() {
        if (!enemyAttacking) {
            enemyAttacking = true;
            setTimeout(() => {
                enemies[enemyTurn].attackRandom();
                setTimeout(() => {
                    setTimeout(() => {
                        enemyAttacking = false;
                        this.changeTurn();
                    }, 200);
                }, 1000);
            }, 200);
        }
    }
};
let Gen = {
    // functions
    image: (src, w, h, sx = 0, sy = 0, sw = w, sh = h) => { // generates an image object from inputted params
        // create image
        let temp = new Image(w, h);
        temp.src = src;
        // return image plus source values
        return {
            image: temp,
            source: [sx, sy, sw, sh]
        };
    },
    animSet(sheets, framewidth, height) { // generates an animation set based on animation sheet
        // create return array and loop through sheets
        let set = [];
        sheets.forEach(sheet => {
            // read sheet data and assign to constants
            const cSheet = sheet[0];
            const frames = sheet[1];
            // create an image object
            let temp = new Image(framewidth * frames, height);
            temp.src = cSheet;
            // add image object to final array
            set.push({
                image: temp,
                width: framewidth,
                height: height,
                frames: frames
            });
        });
        return set;
    },
    tileSet(sheet, r, c, size) {
        // vars
        let sheetWidth = r * size;
        let sheetHeight = c * size;
        // cut up tilesheet
        for (let col = 0; col < r; col++) {
            for (let row = 0; row < c; row++) {
                tiles.push(new GameImage((Gen.image(sheet, sheetWidth, sheetHeight, size * row, size * col, size, size))));
            }
        }
    },
    tileArray(sheet, r, c, size) {
        // vars
        let sheetWidth = r * size;
        let sheetHeight = c * size;
        let array = [];
        // cut up tilesheet
        for (let col = 0; col < r; col++) {
            for (let row = 0; row < c; row++) {
                array.push(new GameImage((Gen.image(sheet, sheetWidth, sheetHeight, size * row, size * col, size, size))));
            }
        }
        return array;
    },
    projectile(user, target, speed, color, colorV, size, lifetime) { //defines the projectiles that come out of all the damaging moves
        const dX = target.position.x - user.position.x;
        const dY = user.position.y - target.position.y;

        particles.push(new Particle(
            user.position.x, user.position.y, Cal.rng(0, 90),
            dX / speed, -dY / speed, Cal.rng(0, 90),
            color, colorV,
            size, lifetime
        ));
    },
    button(click, text, x, y) { //makes the buttons on the battle menu
        gui.push(new Gui(new GameImage(Gen.image("./assets/gui_button.png", 60, 12), x, y), click, text));
    }
};
let Ren = {
    // vars
    scale: 0,
    scale_height: 0,
    // functions
    clearCanvas: () => ctx.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight), // clears the canvas
    resizeCanvas() { // resizes the canvas
        ctx.imageSmoothingEnabled = false; // keep this off :(
        // scale canvas & set size
        ctx.scale(document.body.clientWidth / canvas.width, document.body.clientHeight / canvas.height);
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        // define scaling variables
        Ren.scale = document.body.clientWidth / 319;
        Ren.scale_height = document.body.clientHeight / 203;
    },

    image(x, y, img) { // renders an image
        ctx.imageSmoothingEnabled = false; // keep this off :(
        // setup position/size constants
        const sw = img.source[2];
        const sh = img.source[3];
        const rw = sw * Ren.scale;
        const rh = sh * Ren.scale;
        // draw the image
        ctx.drawImage(img.image, img.source[0], img.source[1], sw, sh, x - (rw / 2), y - (rh / 2), rw, rh);
    },
    animFrame(x, y, sheet, frame) { // draws a frame of an animatio nset
        ctx.imageSmoothingEnabled = false; // keep this off :(
        // setup position/size constants
        const bw = sheet.width;
        const bh = sheet.height;
        const rw = bw * Ren.scale;
        const rh = bh * Ren.scale;
        // draw the frame
        ctx.fillStyle = "#000";
        // ctx.fillRect(x - (rw / 2), y - (rh / 2), rw, rh);
        ctx.drawImage(sheet.image, bw * frame, 0, bw, bh, x - (rw / 2), y - (rh / 2), rw, rh);
    },

    tileMap() {
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[0].length; c++) {
                let t = tiles[map[r][c]];
                t.setPos(c * (t.image.image.width / (8 / Ren.scale)), r * (t.image.image.height / (8 / Ren.scale)));
                t.draw();
            }
        }
    },
    statBar(p, x, y, hC = "#4d4", mC = "#dd4", lC = "#d44") {
        ctx.imageSmoothingEnabled = false; // keep this off :(
        // enforce bar percentage limits
        if (p < 0) p = 0;
        if (p > 100) p = 100;
        // draw background
        ctx.fillStyle = "#000";
        ctx.fillRect(x + 8 * Ren.scale, y, 100 / (100 / 16) * Ren.scale, 2 * Ren.scale);
        // determine bar color
        if (p >= 60) ctx.fillStyle = hC;
        else if (p >= 20) ctx.fillStyle = mC;
        else if (p >= 0) ctx.fillStyle = lC;
        // draw bar line
        ctx.fillRect(x + 8 * Ren.scale, y, p / (100 / 16) * Ren.scale, 2 * Ren.scale);
    },
    screenText(string, x, y, size = 0) {
        // vars
        const charnum = [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
        ];
        let s = fonts[size].size * Ren.scale;
        let offset = 0;
        // loop through string
        for (let i = 0; i < string.length; i++) {
            let c = string[i]; // current char
            let index = charnum.indexOf(c); // index of char

            if (c === "/") {
                offset = i + 1;
                y += s;
            }

            if (index !== -1) {
                let char = fonts[size].font[index];
                char.setPos(x + ((i * s) + (s / 2) + (Ren.scale / 2)) - (offset * s), y + (s / 2) + (Ren.scale / 2));
                char.draw();
            }
        }
    }
};
// on page load
Ren.resizeCanvas();
console.log(`canvas resized`);