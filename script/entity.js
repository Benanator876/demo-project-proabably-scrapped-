class Entity {
    constructor(x, y, animset) {
        // object properties
        this.position = {
            x: x,
            y: y,
            angle: 0
        };
        this.anim = {
            set: animset,
            current: animset[0],
            frame: Math.round(Cal.rng(0, animset[0].frames - 1))
        };
    }
    // tick functions
    damage = (damage) => this.stats.hp -= damage;
    move(x = 0, y = 0, a = 0) { // moves the entity based on current position
        // add to current position values
        this.position.x += x;
        this.position.y += y;
        this.position.angle += a;
    }
    setPos(x = this.position.x, y = this.position.y, a = this.position.angle) { // sets the current position of the entity
        // set current position values
        this.position.x = x;
        this.position.y = y;
        this.position.angle = a;
    }
    // render functions
    draw() { // draws the object on screen
        // define center of object
        const centerX = this.position.x - (this.anim.current.width / 2);
        const centerY = this.position.y - (this.anim.current.height / 2);
        // setup context
        ctx.save();
        ctx.beginPath();
        // set origin to center & apply rotation
        ctx.translate(centerX, centerY);
        ctx.rotate(Cal.radian(this.position.angle));
        // increase/reset frame number
        if (this.anim.frame >= this.anim.current.frames) {
            this.anim.frame = 0;
        } else {
            this.anim.frame += 0.25;
        }
        // render animation frame
        Ren.animFrame(this.anim.current.width / 2, this.anim.current.height / 2, this.anim.current, Math.floor(this.anim.frame));
        // reset context
        ctx.restore();
    }
    setAnim(index) { // change current animation
        this.anim.current = this.anim.set[index];
    }
}

class Enemy extends Entity {
    constructor(name, x, y, animset, stats, moveset) {
        // pass args to parent
        super(x, y, animset);
        // object properties
        this.name = name;
        this.baseStats = stats;
        this.stats = stats;
        this.maxHP = stats.hp;
        this.moveset = moveset;

        this.levelup();
    }
    // tick functions
    damage(damage) {
        this.stats.hp -= damage;
        console.log("e");
    }
    levelup() {
        const level = this.stats.level;
        // update all stats
        this.stats.hp = Cal.level.hp(this.baseStats.hp, level);
        this.stats.mana = Cal.level.mana(this.baseStats.mana, level);
        this.stats.atk = Cal.level.stat(this.baseStats.atk, level);
        this.stats.def = Cal.level.stat(this.baseStats.def, level);
        this.stats.spatk = Cal.level.stat(this.baseStats.spatk, level);
        this.stats.spdef = Cal.level.stat(this.baseStats.spdef, level);
        // set max hp
        this.maxHP = this.stats.hp;
    }
    // render functions
    render() {
        // check to see if it's livin' and remove it if it isn't
        if (this.stats.hp <= 0) {
            p_generators.push(new ParticleGen(
                this.position.x - this.anim.current.width / 2,
                this.position.y - this.anim.current.height / 2,
                0, 0, 0, {
                    r: 220,
                    g: 80,
                    b: 80
                }, 1, true,
                25, 20, 1, 3));
            setTimeout(() => p_generators[p_generators.length - 1].remove(), 100);
            enemies.splice(enemies.indexOf(this), 1);
            return;
        } 
        if (this.stats.hp > this.maxHP) this.stats.hp = this.maxHP;
        // otherwise draw
        const hpPercent = (this.stats.hp / this.maxHP) * 100;
        const halfWidth = (this.anim.current.width / 2 * Ren.scale);
        const barHeight = ((this.anim.current.height - 15) * Ren.scale);

        this.draw();
        Ren.statBar(hpPercent, this.position.x - halfWidth, this.position.y + barHeight);
    }
    // game functions
    attackRandom() {
        const t = characters[Math.floor(Cal.rng(0, characters.length - 1))];
        const m = this.moveset[Math.floor(Cal.rng(0, this.moveset.length - 1))];

        m.use(this, t);
    }
}

class Character extends Entity {
    constructor(name, x, y, animset, stats, moveset) {
        // pass args to parent
        super(x, y, animset);
        // object properties
        this.name = name;
        this.baseStats = stats;
        this.stats = stats;
        this.maxHP = stats.hp;
        this.moveset = moveset;

        this.levelup();
    }
    // tick functions
    damage = damage => this.stats.hp -= damage;
    levelup() {
        const level = this.stats.level;
        // update all stats
        this.stats.hp = Cal.level.hp(this.baseStats.hp, level);
        this.stats.mana = Cal.level.mana(this.baseStats.mana, level);
        this.stats.atk = Cal.level.stat(this.baseStats.atk, level);
        this.stats.def = Cal.level.stat(this.baseStats.def, level);
        this.stats.spatk = Cal.level.stat(this.baseStats.spatk, level);
        this.stats.spdef = Cal.level.stat(this.baseStats.spdef, level);
        // set max hp
        this.maxHP = this.stats.hp;
    }
    // render functions
    render() {
        // check to see if it's livin' and remove it if it isn't
        if (this.stats.hp <= 0) {
            p_generators.push(new ParticleGen(
                this.position.x - this.anim.current.width / 2, this.position.y - this.anim.current.height / 2,
                0, 0, 0, {
                    r: 220,
                    g: 80,
                    b: 80
                }, 1, true,
                25, 20, 1, 3));
            setTimeout(() => p_generators[p_generators.length - 1].remove(), 100);
            characters.splice(characters.indexOf(this), 1);
            return;
        }
        if (this.stats.hp > this.maxHP) this.stats.hp = this.maxHP;
        // otherwise draw
        const hpPercent = (this.stats.hp / this.maxHP) * 100;
        const halfWidth = (this.anim.current.width / 2 * Ren.scale);
        const barHeight = ((this.anim.current.height - 15) * Ren.scale);

        this.draw();
        Ren.statBar(hpPercent, this.position.x - halfWidth, this.position.y + barHeight);
    }
}