function setup() {
    document.addEventListener("mousemove", e => { // mouse position tracker
        // set mouse variables to event position
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseup", e => { // mouse click tracker
        sound.music.audio.play();
        enemies.forEach(enemy => { // target selector
            // local vars
            const w = enemy.anim.current.width * Ren.scale;
            const h = enemy.anim.current.height * Ren.scale;
            const x = enemy.position.x - w / 2;
            const y = enemy.position.y - h / 2;
            // if within bounds set target
            if (Cal.withinBoundary(x, y, w, h, e)) {
                target = enemies.indexOf(enemy);
                if (target === -1) target = 0;
            }
        });
        gui.forEach(i => i.checkBoundingBox(e));
    });
    console.log("created mouse listeners");

    sound.music.audio.volume = 0.25;
    sound.fanfare.audio.volume = 0.25;

    window.requestAnimationFrame(gameLoop);
    console.log("initialized game loop");
    console.info(",----------------------------------------------------------------------------,");
    console.info("| RPG Battle demo created by Ben Metzger, Ethan Lynch, and Leighland Rodrigo |");
    console.info("'----------------------------------------------------------------------------'");
}

function gameLoop() { // main game loop
    tick();
    render();
    gametime++;

    setTimeout(() => {
        Ren.clearCanvas();
        window.requestAnimationFrame(gameLoop);
    }, 1000 / Cal.fps);
}

function tick() { // calculation functions go here
    gameover = (enemies.length === 0 || characters.length === 0);

    if (!gameover) {
        cursor.setPos(mouse.x, mouse.y);

        if (enemies[target] === undefined) target = 0;
        if (characters[turn] === undefined) turn = 0;

        gui[1].image.setPos(enemies[target].position.x - 12 * Ren.scale, enemies[target].position.y + 18 * Ren.scale);
        gui[2].image.setPos(characters[turn].position.x - 12 * Ren.scale, characters[turn].position.y + 18 * Ren.scale);

        p_generators.forEach(gen => gen.gen_particles()); // generate new particles if possible
        particles.forEach(particle => particle.update()); // tick all independent particles
        activeParticles.forEach(particle => particle.update()); // tick all existing particles

        if (isEnemyTurn) {
            Cal.enemyturn();
        }
    } else {
        sound.music.audio.volume = 0;
        if (sound.fanfare.plays === 0) {
            sound.fanfare.audio.play();
            sound.fanfare.plays++;
        }
    }
}

function render() { // rendering functions go here
    Ren.tileMap();

    enemies.forEach(enemy => enemy.render()); // render enemies
    characters.forEach(character => character.render()); // render characters

    for (let i = activeParticles.length - 1; i >= 0; i--) activeParticles[i].draw(); // render particles
    for (let i = particles.length - 1; i >= 0; i--) particles[i].draw(); // render independent particles

    gui.forEach(graphic => graphic.draw()); // render gui
    text.forEach(t => t());

    cursor.draw();
}