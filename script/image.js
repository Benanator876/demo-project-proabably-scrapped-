class GameImage {
    constructor(image, x = 0, y = 0) {
        this.image = image;
        this.position = {
            x: x,
            y: y,
            angle: 0
        };
    }
    move(x = 0, y = 0) {
        this.position.x += x;
        this.position.y += y;
    }
    setPos(x = this.position.x, y = this.position.y) {
        this.position.x = x;
        this.position.y = y;
    }
    draw() { // draws the image onto the canvas
        Ren.image(this.position.x, this.position.y, this.image);
    }
}