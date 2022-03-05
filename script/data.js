const cursor = new GameImage(Gen.image("./assets/gui_cursor.png", 16, 16), mouse.x, mouse.y); // cursor

const attackButton = new Gui( // huge button script idk where else to put it
    new GameImage(Gen.image("./assets/gui_button.png", 60, 12), Ren.scale * 95, Ren.scale * 154), () => {
        const atkimg = Gen.image("./assets/gui_atkicon.png", 8, 8),
            spatkimg = Gen.image("./assets/gui_spatkicon.png", 8, 8),
            healimg = Gen.image("./assets/gui_healicon.png", 8, 8);

        const char = characters[turn];
        // determine move types
        let imgA = (char.moveset[0].type === 'p' ? atkimg : (char.moveset[0].type === 'm' ? spatkimg : healimg)),
            imgB = (char.moveset[1].type === 'p' ? atkimg : (char.moveset[1].type === 'm' ? spatkimg : healimg));
        // remove old buttons
        gui.splice(gui.indexOf(this), 1);
        text.splice(0, 1);
        // push buttons
        Gen.button(() => {
            gui.splice(3, 4);
            char.moveset[0].use(char, enemies[target]);
            Cal.changeTurn();
        }, char.moveset[0].info.name, Ren.scale * 95, Ren.scale * 145);
        Gen.button(() => {
            gui.splice(3, 4);
            char.moveset[1].use(char, enemies[target]);
            Cal.changeTurn();
        }, char.moveset[1].info.name, Ren.scale * 95, Ren.scale * 163);
        // push gui
        gui.push(new Gui(new GameImage(imgA, Ren.scale * 129, Ren.scale * 145), () => {}, "."));
        gui.push(new Gui(new GameImage(imgB, Ren.scale * 129, Ren.scale * 163), () => {}, ","));
        // push text
        text.push(() => Ren.screenText(char.moveset[0].info.desc, Ren.scale * 134, Ren.scale * 142, 2));
        text.push(() => Ren.screenText(char.moveset[1].info.desc, Ren.scale * 134, Ren.scale * 160, 2));
    }, "Attack");
const attackText = () => () => Ren.screenText("Click an enemy/to target it", Ren.scale * 128, Ren.scale * 148, 2);

let tiles = [];
Gen.tileSet("./assets/tile_sheet.png", 8, 8, 32);
console.log(`${tiles.length} tiles loaded`);

let map = [ // stores background map information
    [24, 00, 00, 00, 00, 00, 00, 00, 36, 21, 22],
    [00, 00, 00, 00, 00, 48, 00, 00, 36, 29, 30],
    [00, 00, 32, 00, 00, 00, 00, 00, 45, 40, 40],
    [05, 01, 01, 01, 01, 01, 01, 01, 01, 01, 06],
    [13, 02, 02, 02, 02, 02, 02, 02, 02, 02, 14],
    [00, 49, 00, 00, 00, 00, 00, 00, 00, 24, 00],
    [00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00],
    [63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63],
    [63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63],
    [63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63]
];
console.log(`tilemap loaded`);

let gui = [ // this holds all gui objects, initialize them here
    new Gui(new GameImage(Gen.image("./assets/gui_textbox.png", 200, 40), canvas.width / 2 + Ren.scale / 2, Ren.scale * 154)), // text box
    new Gui(new GameImage(Gen.image("./assets/gui_target.png", 8, 8), 0, 0)), // target
    new Gui(new GameImage(Gen.image("./assets/gui_turn.png", 8, 8), 0, 0)), // turn id
    attackButton
];
console.log(`${gui.length} gui items loaded`);

let text = [ // this holds all drawn text, initialize them here
    attackText()
];

let fonts = [ // this holds all fonts, initialize them here
    {
        font: Gen.tileArray("./assets/font/font1.png", 1, 62, 8),
        size: 8
    }, {
        font: Gen.tileArray("./assets/font/font2.png", 1, 62, 6),
        size: 7
    }, {
        font: Gen.tileArray("./assets/font/font3.png", 1, 62, 5),
        size: 6
    },
];
console.log(`${fonts.length} fonts loaded`)

let sound = { //this plays victory fanfare
    fanfare: {
        audio: new Audio("./assets/sound/music_victory.mp3"),
        plays: 0,
        resetPlays: () => this.plays = 0,
        playonce: () => {
            if (this.plays === 0) {
                this.audio.play();
                this.plays++;
            }
        }
    },
    music: {
        audio: new Audio("./assets/sound/music_theme.mp3"),
        plays: 0,
        resetPlays: () => this.plays = 0,
        playonce: () => {
            if (this.plays === 0) {
                this.audio.play();
                this.plays++;
            }
        }
    }
};
console.log(`sounds loaded`);

let moves = [ //defines the stats and descriptions of the moves
    new Ability(8, 'p', {
        name: "Arrow",
        desc: "Shoots an arrow",
        tooltip: " was shot"
    }, (user, target) => {
        if (target === undefined) return;

        Gen.projectile(
            user, target, 25, {
                r: 255,
                g: 255,
                b: 127
            }, {
                r: 0,
                g: 0,
                b: 0
            },
            25, 25
        );
        setTimeout(() => target.damage(Cal.damage(user.stats.atk, 8, target.stats.def)), 30 * (1000 / Cal.fps));
    }),
    new Ability(8, 'h', {
        name: "Heal Goo",
        desc: "Heal an ally",
        tooltip: " was healed"
    }, (user, target) => {
        target = characters[0];
        if (target === user) return;

        Gen.projectile(
            user, target, 40, {
                r: 127,
                g: 255,
                b: 120
            }, {
                r: 1,
                g: 0,
                b: 5
            },
            40, 40
        );
        setTimeout(() => target.damage(Cal.healing(8), 40 * (1000 / Cal.fps)));
    }),
    new Ability(8, 'p', {
        name: "Stab",
        desc: "Stabs with a knife",
        tooltip: " get stabbed"
    }, (user, target) => {
        if (target === undefined) return;

        p_generators.push(new ParticleGen(
            target.position.x - target.anim.current.width / 2,
            target.position.y - target.anim.current.height / 2,
            0, 0, 0, {
                r: 220,
                g: 80,
                b: 80
            }, 1, true,
            5, 20, 15, 2));
        setTimeout(() => p_generators[p_generators.length - 1].remove(), 100);

        target.damage(Cal.damage(user.stats.atk, 8, target.stats.def))
    }),
    new Ability(8, 'm', {
        name: "Mage Orb",
        desc: "Shoots a magic orb",
        tooltip: " gets shot with magic"
    }, (user, target) => {
        if (target === undefined) return;

        Gen.projectile(
            user, target, 50, {
                r: 0,
                g: 0,
                b: 220
            }, {
                r: 15,
                g: 0,
                b: 0
            },
            25, 50
        );
        setTimeout(() => target.damage(Cal.damage(user.stats.spatk, 8, target.stats.spdef)), 50 * (1000 / Cal.fps));
    }),
    new Ability(8, 'p', {
        name: "Bonk!",
        desc: "Get bashed into by an enemy"
    }, (user, target) => {
        if (target === undefined) return;
        
        text = [() => Ren.screenText(`${target.name} gets bashed into`, Ren.scale * 65, Ren.scale * 150, 2)];

        p_generators.push(new ParticleGen(
            target.position.x - target.anim.current.width / 2,
            target.position.y - target.anim.current.height / 2,
            0, 0, 0, {
                r: 170,
                g: 170,
                b: 170
            }, 1, true,
            25, 25, 10, 10));
        setTimeout(() => p_generators[p_generators.length - 1].remove(), 100);

        target.damage(Cal.damage(user.stats.atk, 8, target.stats.def));
    }),
    new Ability(8, 'p', {
        name: "Harden",
        desc: "Skin becomes hard and raises defense"
    }, (user, target) => {
        target = user;
        
        text = [() => Ren.screenText(`${target.name} raises its defense`, Ren.scale * 65, Ren.scale * 150, 2)];

        p_generators.push(new ParticleGen(
            target.position.x, target.position.y, 
            0, 0, 0, {
                r: 70,
                g: 90,
                b: 220
            }, 1, true,
            5, 10, 15, 6));
        setTimeout(() => p_generators[p_generators.length - 1].remove(), 1000);

        target.stats.def += 10;
    }),
    new Ability(8, 'm', { // rgb(0,220,0)
        name: "Laser Vision",
        desc: " gets shot by a laser beam"
    }, (user, target) => {
        if (target === undefined) return;
        
        text = [() => Ren.screenText(`${target.name} is hit with a laser`, Ren.scale * 65, Ren.scale * 150, 2)];

        p_generators.push(new ParticleGen(
            user.position.x, user.position.y + (user.anim.current.height),
            -25, 0, 0, {
                r: 0,
                g: 220,
                b: 0
            }, 1, true,
            0, 15, 40, 6));
        setTimeout(() => p_generators[p_generators.length - 1].remove(), 500);

        target.damage(Cal.damage(user.stats.spatk, 8, target.stats.spdef));
    }),
    new Ability(8, 's', {
        name: "Blink",
        desc: "Eye become moist and raises special attack",
        tooltip: " raises its magic attack "
    }, (user, target) => {
        target = user;
        
        text = [() => Ren.screenText(`${target.name} raises its magic attack`, Ren.scale * 65, Ren.scale * 150, 2)];

        p_generators.push(new ParticleGen(
            target.position.x, target.position.y, 
            0, 0, 0, {
                r: 70,
                g: 220,
                b: 110
            }, 1, true,
            5, 10, 15, 6));
        setTimeout(() => p_generators[p_generators.length - 1].remove(), 1000);

        target.stats.spatk += 10;
    }),
];
console.log(`${moves.length} moves loaded`);

let enemies = [ // this holds all enemies, initialize them here
    new Enemy("Baby", Ren.scale * 240, Ren.scale * 80, // concrete baby
        Gen.animSet([
            ["./assets/enemy_concretebaby.png", 31],
        ], 32, 32), {
            level: 1,
            hp: 70,
            mana: 0,
            atk: 25,
            def: 40,
            spatk: 10,
            spdef: 20,
            evd: 0
        }, [moves[4], moves[5]]
    ),
    new Enemy("Eyeball", Ren.scale * 240, Ren.scale * 112, // eyeball
        Gen.animSet([
            ["./assets/enemy_energeticeyeball.png", 7],
        ], 32, 32), {
            level: 1,
            hp: 40,
            mana: 0,
            atk: 10,
            def: 20,
            spatk: 25,
            spdef: 30,
            evd: 3
        }, [moves[6], moves[7]]
    ),
];
console.log(`${enemies.length} enemies loaded`);
let characters = [ // this holds all characters, initialize them here
    new Character("Keto", Ren.scale * 84, Ren.scale * 80, // keto
        Gen.animSet([
            ["./assets/character_keto.png", 9],
        ], 32, 32), {
            level: 1,
            hp: 60,
            mana: 30,
            atk: 50,
            def: 50,
            spatk: 50,
            spdef: 50,
            evd: 5
        }, [moves[2], moves[3]]),
    new Character("Jason", Ren.scale * 84, Ren.scale * 112, // jason
        Gen.animSet([
            ["./assets/character_jason.png", 7],
        ], 32, 32), {
            level: 1,
            hp: 60,
            mana: 40,
            atk: 60,
            def: 30,
            spatk: 25,
            spdef: 30,
            evd: 5
        }, [moves[0], moves[1]]),
];
console.log(`${characters.length} characters loaded`);

let p_generators = [];
let particles = [];