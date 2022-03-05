class Ability {
    constructor(basePower = 60, type = 'p', info, onUse) {
        // defaults
        if (info === undefined) info = {
            name: "Missing title",
            desc: "Someone forgot to put info into here... blame Ethan.",
        };
        if (onUse === undefined) onUse = (user, target) => {
            // in case 
            if (target === undefined) return;
            target.damage(Cal.dmg(user.stats.atk, this.bp, target.stats.def));
            p_generators.push(new ParticleGen(
                target.position.x - target.anim.current.width / 2, target.position.y - target.anim.current.height / 2,
                0, 0, 0, {
                    r: 220,
                    g: 60,
                    b: 60
                }, 2, true,
                25, 20, 1, 5));
            setTimeout(() => p_generators[p_generators.length - 1].remove(), 200);
        };
        // object properties
        this.bp = basePower;
        this.type = type;
        this.info = info;
        this.onUse = onUse;
    }
    use = (user, target) => {
        this.onUse(user, target);
    };
}