import { GLOBAL, LINESET, SCREEN } from '../config/config.js';

const canvas = document.getElementById('Merry-ChristMas');
const ctx = canvas.getContext('2d');

class TreeLine {

    constructor(config) {

        this._config = config;
        this.offset = 0;
    }

    render() {

        this.offset--;

        if (this.offset <= -GLOBAL.frameRate) this.offset += GLOBAL.frameRate;

        this.generativeLines();
    }

    drawLines(line) {

        const [alpha, start, end] = line;

        ctx.stroke();
        ctx.strokeStyle = this._config.foreground;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
    }

    generativeLines() {
        const { lineSpacing, lineLength, frameRate } = GLOBAL;
        const { thetaMin, thetaMax } = LINESET;
        const { angleOffset } = this._config;
        const rate = 1 / (2.5 * Math.PI);
        const factor = rate / 3;

        let theta = thetaMin + this.getThetaChangeRate(thetaMin, this.offset * lineSpacing / frameRate, rate, factor);

        for (; theta < thetaMax; theta += this.getThetaChangeRate(theta, lineSpacing, rate, factor)) {
            let thetaNew = 0, thetaOld = 0;
            thetaOld = (theta >= thetaMin) ? theta : thetaMin;
            thetaNew = theta + this.getThetaChangeRate(theta, lineLength, rate, factor);
            if (thetaNew <= thetaMin) continue;
            const start = this.getPointByAngle(thetaOld, factor, angleOffset, rate, SCREEN);
            const end = this.getPointByAngle(thetaNew, factor, angleOffset, rate, SCREEN);
            const alpha = Math.atan((start.y * factor / rate * .1 + .02 - start.z) * 40) * .35 + .65;
            this.drawLines([alpha, start, end]);
        }
    }


    getThetaChangeRate(theta, lineLength, rate, factor) {

        return lineLength / Math.sqrt(rate * rate + factor * factor * theta * theta);
    }

    getPointByAngle(theta, factor, angleOffset, rate, screen) {
        const { camY, camZ, offsetX, offsetY, scaleX, scaleY } = screen;
        const offsetted = theta + angleOffset;
        const x = theta * factor * Math.cos(offsetted);
        const y = rate * theta;
        const z = -theta * factor * Math.sin(offsetted);

        // return 3d converted
        return {
            x: offsetX + scaleX * (x / (z - camZ)),
            y: offsetY + scaleY * ((y - camY) / (z - camZ))
        };
    };
}

function resizing() {

    const height = window.innerHeight;
    const width = window.innerWidth;

    canvas.width = width;
    canvas.height = height;
    LINESET.thetaMax = Math.sqrt(height * Math.PI / 2);
    SCREEN.offsetX = width * .5;
    SCREEN.offsetY = height * .5;
    SCREEN.scaleX = height * .5;
    SCREEN.scaley = height * .5;
};

function renderFrame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    treeLines.forEach(line => line.render());
    requestAnimationFrame(renderFrame);
}

const treeLines = [
    new TreeLine({
        foreground: "#ffffff",
        angleOffset: 3,
    }),
    new TreeLine({
        foreground: "#ffcc00",
        angleOffset: 2,
    }),
    new TreeLine({
        foreground: "#ff0000",
        angleOffset: 1,
    }),
    new TreeLine({
        foreground: "#00ffcc",
        angleOffset: 0,
    })
]

resizing();
renderFrame();
window.addEventListener('resize', resizing, false);