// global variables
let activeParticles = [];

// classes
class Particle {
    constructor(x = 0, y = 0, a = 0, xv = 0, yv = 0, av = 0, color, colorv, size = 5, lifetime = 100) {
        // default values
        if (color === undefined) color = {
            r: 0,
            g: 0,
            b: 0
        };
        if (colorv === undefined) colorv = {
            r: 1,
            g: 1,
            b: 1
        };
        // object properties
        // position
        this.position = {
            x: x,
            y: y,
            angle: a
        };
        this.velocity = {
            x: xv,
            y: yv,
            angle: av
        };
        // color
        this.color = color;
        this.colorv = colorv;
        this.colorMod = {
            r: 1,
            g: 1,
            b: 1
        };
        // size
        this.size = size;
        this.ren_size = size;
        // lifetime
        this.life = 0;
        this.lifetime = lifetime;
    }
    // tick functions
    update() {
        // check lifetime & delete if the particle is too old
        if (this.life >= this.lifetime) {
            activeParticles.splice(activeParticles.indexOf(this), 1);
            particles.splice(particles.indexOf(this), 1);
        }
        // add velocities to particle
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.angle += this.velocity.angle;
        // enforce rgb limits
        if (!this.keepColor) { // if non-strict colors
            // top limit
            if (this.color.r + this.colorv.r >= 255 && this.colorMod.r === 1) this.colorMod.r = -1;
            if (this.color.g + this.colorv.g >= 255 && this.colorMod.g === 1) this.colorMod.g = -1;
            if (this.color.b + this.colorv.b >= 255 && this.colorMod.b === 1) this.colorMod.b = -1;
            // bottom limit
            if (this.color.r - this.colorv.r <= 0 && this.colorMod.r === -1) this.colorMod.r = 1;
            if (this.color.g - this.colorv.g <= 0 && this.colorMod.g === -1) this.colorMod.g = 1;
            if (this.color.b - this.colorv.b <= 0 && this.colorMod.b === -1) this.colorMod.b = 1;
        } else { // if strict colors
            if ((this.colorMod.r || this.colorMod.g || this.colorMod.b) === 1) {
                // top limit
                if ((this.color.r + this.colorv.r || this.color.g + this.colorv.g || this.color.b + this.colorv.b) >= 255) {
                    this.colorMod.r = -1;
                    this.colorMod.g = -1;
                    this.colorMod.b = -1;
                }
            } else {
                // bottom limit
                if ((this.color.r - this.colorv.r || this.color.g - this.colorv.g || this.color.b - this.colorv.b) <= 0) {
                    this.colorMod.r = 1;
                    this.colorMod.g = 1;
                    this.colorMod.b = 1;
                }
            }
        }
        // add color velocities to particle
        this.color.r += this.colorv.r * this.colorMod.r;
        this.color.g += this.colorv.g * this.colorMod.g;
        this.color.b += this.colorv.b * this.colorMod.b;
        // adjust size to match lifetime
        this.ren_size = this.size - (this.size * (this.life / this.lifetime));
        // add 1 to local lifetime;
        this.life++;
    }
    setPosition(x = this.position.x, y = this.position.y, a = this.position.angle) {
        // sets current position to argument values, defaults to current position
        this.position.x = x;
        this.position.y = y;
        this.position.angle = a;
    }
    setVelocity(x = this.velocity.x, y = this.velocity.y, a = this.velocity.angle) {
        // sets current velocity to argument values, defaults to current velocity
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.angle = a;
    }
    // render functions
    draw() {
        // define center of object
        const centerX = this.position.x - this.ren_size / 2;
        const centerY = this.position.y - this.ren_size / 2;
        // setup context
        ctx.save();
        ctx.beginPath();
        // set origin to center & apply rotation
        ctx.translate(centerX, centerY);
        ctx.rotate(Cal.radian(this.position.angle));
        // draw particle
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.fillRect(-this.ren_size / 2, -this.ren_size / 2, this.ren_size, this.ren_size);
        // reset context
        ctx.restore();
    }
    setColor(r = this.color.r, g = this.color.g, b = this.color.b) {
        // sets current color to argument values, defaults to current color
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
    }
    setColorVelocity(r = this.colorv.r, g = this.colorv.g, b = this.colorv.b) {
        // sets current color velocity to argument values, defaults to current color velocity
        this.colorv.r = r;
        this.colorv.g = g;
        this.colorv.b = b;
    }
}

class ParticleGen {
    // constructor(centerX = 0, centerY = 0, xv = 0, yv = 0, av = 0, randomness = 1, size = 5, color, colorRandomness = 1, lifetime = 10, keepColor = true) {
    constructor(x = 0, y = 0, xv = 0, yv = 0, av = 0, color, colorR = 1, keepColor = true, randomness = 1, size = 5, lifetime = 10, particleAmount = 1) {
        // default values
        if (color === undefined) color = {
            r: 0,
            g: 0,
            b: 0
        };
        // object properties
        // position
        this.position = {
            x: x,
            y: y
        };
        this.velocity = {
            x: xv,
            y: yv,
            angle: av
        };
        // color
        this.c = color;
        this.cr = colorR;
        this.keepColor = keepColor;
        // misc
        this.r = randomness;
        this.size = size;
        this.lifetime = lifetime;
        this.particleAmount = particleAmount;
    }
    // tick functions
    remove = () => p_generators.splice(p_generators.indexOf(this), 1);
    gen_particles() {
        for (let i = 0; i < this.particleAmount; i++) {
            // if keeping color then set this to the modify rate, else use default
            let colorv = false;
            if (this.keepColor) colorv = Cal.rng(-this.cr, this.cr);
            // create a particle with random values
            activeParticles.push(
                new Particle(
                    // position + randomness
                    this.position.x + Cal.rng(-this.r, this.r),
                    this.position.y + Cal.rng(-this.r, this.r),
                    Cal.rng(-this.r, this.r),
                    // velocity + randomness
                    this.velocity.x + Cal.rng(-this.r, this.r),
                    this.velocity.y + Cal.rng(-this.r, this.r),
                    this.velocity.angle + Cal.rng(-this.r, this.r),
                    // color + randomness
                    {
                        r: this.c.r + Cal.rng(-this.cr, this.cr),
                        g: this.c.g + Cal.rng(-this.cr, this.cr),
                        b: this.c.b + Cal.rng(-this.cr, this.cr)
                    },
                    // color velocity + randomness
                    {
                        r: colorv || Cal.rng(-this.cr, this.cr),
                        g: colorv || Cal.rng(-this.cr, this.cr),
                        b: colorv || Cal.rng(-this.cr, this.cr)
                    },
                    // other attributes
                    this.size + Cal.rng(-this.r, this.r),
                    this.lifetime + Math.round((Cal.rng(-this.r, this.r)) / 2)
                )
            );
        }
    }
}