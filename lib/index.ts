
// @ts-ignore
import { default as Kinet } from 'kinet';

export default class Blobify {

    public readonly defaultOptions = {
        rect: {
            width: 20,
            height: 20
        },
        radius: 50
    };

    private cursor: HTMLDivElement;
    private kinet: Kinet;

    private options: Object;

    constructor(options = {}) {

        // Merge default configuration
        Object.assign({}, this.defaultOptions, options)
        this.options = options;

        // Create a new HTML element and append it to the document's body
        this.cursor = document.createElement("div");
        document.body.appendChild(this.cursor);

        // Style the cursor
        this.circle_default(options)

        this.kinet = new Kinet({
            acceleration: 0.06,
            friction: 0.20,
            names: ["x", "y"],
        });

        // set handler on kinet tick event
        this.kinet.on('tick', this.kinet_tick.bind(this));

        // call kinet animate method on mousemove
        document.addEventListener('mousemove', this.mousemove.bind(this));
    }

    // Events

    private mousemove(event: MouseEvent) {
        this.kinet.animate('x', event.clientX - window.innerWidth/2);
        this.kinet.animate('y', event.clientY - window.innerHeight/2);
    }

    // Kinet events
    private kinet_tick(instances: any) {
        this.cursor.style.transform = `translate3d(${ (instances.x.current) }px, ${ (instances.y.current) }px, 0) rotateX(${ (instances.x.velocity/2) }deg) rotateY(${ (instances.y.velocity/2) }deg)`;
    }

    // styles
    private circle_default(options: any) {
        this.cursor.style.width = '40px';
        this.cursor.style.height = '40px';
        this.cursor.style.background = 'linear-gradient(to top left, #0062bE, #00A2FE)';
        this.cursor.style.borderRadius = '50%';
        this.cursor.style.position = 'absolute';
        this.cursor.style.top = '50%';
        this.cursor.style.left = '50%';
        this.cursor.style.margin = '-20px 0 0 -20px';
        this.cursor.style.left = '50%';
        this.cursor.style.pointerEvents = 'none';
        this.cursor.style.mixBlendMode = 'multiply';
        this.cursor.style.zIndex = '10';
    }
}

