class Gui {
    constructor(image, click, text = "") {
        if (click === undefined) click = () => {};
        this.image = image;
        this.click = click;
        this.text = text;
    }
    remove = () => gui.splice(gui.indexOf(this), 1);
    draw = () => {
        const w = this.image.image.image.width * Ren.scale;
        const h = this.image.image.image.height * Ren.scale;
        const x = this.image.position.x - w / 2 + 1 * Ren.scale;
        const y = this.image.position.y - h / 2 + 2 * Ren.scale;
        this.image.draw();
        Ren.screenText(this.text, x, y, 1);
    }
    checkBoundingBox(e) {
        const w = this.image.image.image.width * Ren.scale;
        const h = this.image.image.image.height * Ren.scale;
        const x = this.image.position.x - w / 2;
        const y = this.image.position.y - h / 2;
        const b = Cal.withinBoundary(x, y, w, h, e);
        if (b) this.click();
    }
}