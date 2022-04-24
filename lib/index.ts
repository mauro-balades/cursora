// @ts-ignore
import { default as Kinet } from "kinet";
import { textChangeRangeIsUnchanged } from "typescript";

export default class Blobify {
    public readonly defaultOptions = {
        size: 40,
        bg: "#dee2e6",
        radius: 20,
        opacity: 1,
        type: "normal",
    };

    private readonly focusableElements =
        "[data-blobify], a:not([data-no-blobify]), button:not([data-no-blobify]), [data-blobify-tooltip]";
    private cursor: HTMLDivElement;
    private kinet: Kinet;

    private focusedElement: HTMLElement | null = null;
    private options: any;

    constructor(options = {}) {
        // Merge default configuration
        this.options = Object.assign({}, this.defaultOptions, options);

        // Create a new HTML element and append it to the document's body
        this.cursor = document.createElement("div");
        document.body.appendChild(this.cursor);

        // Style the cursor
        this.circle_default();

        this.kinet = new Kinet({
            acceleration: 0.06,
            friction: 0.2,
            names: ["x", "y", "height", "width", "radius"],
        });

        // set default variables
        this.kinet.set("height", 40);
        this.kinet.set("width", 40);
        this.kinet.set("radius", 100);
        this.kinet.set("x", 0);
        this.kinet.set("y", 0);

        // set handler on kinet tick event
        this.kinet.on("tick", this.kinet_tick.bind(this));

        // add event listeners
        document.addEventListener("mouseout",   this.mouseout.bind(this));
        document.addEventListener("mouseleave", this.mouseout.bind(this));
        document.addEventListener("mousemove", this.mousemove.bind(this));
        document.addEventListener("mouseover", this.mouseover.bind(this));
    }

    // Events

    private mouseout(event: MouseEvent) {

        if (event.target) {
            const element = (event.target as HTMLElement).closest(
                this.options.focusableElements
            ) as HTMLElement;

            if (element) {
            }
        }
    }

    private mousemove(event: MouseEvent) {
        if (!this.focusedElement) {
            this.kinet.animate("x", event.clientX - window.innerWidth / 2);
            this.kinet.animate("y", event.clientY - window.innerHeight / 2);
        }
    }

    private mouseover(event: MouseEvent) {
        const element = (event.target as HTMLElement).closest(
            // @ts-ignore
            this.focusableElements
        ) as HTMLElement;

        if (element) {
            // @ts-ignore
            const { width, height, x, y } = element.getBoundingClientRect();

            let radius_attr = element.getAttribute("data-blobify-radius");
            let radius = radius_attr
                ? parseInt(radius_attr)
                : this.options.size / 2;

            // TODO: allow customization for offsets
            let offset = 15;
            let h = height + offset;
            let w = width + offset;

            this.focusedElement = element;
            this.kinet.animate("x", x - window.innerWidth / 2  - (offset/2));
            this.kinet.animate("y", y - window.innerHeight / 2 - (offset/2));
            this.kinet.animate("height", h);
            this.kinet.animate("width", w);

            this.kinet.set("radius", radius);
        }
    }

    // Kinet events
    private kinet_tick(instances: any) {
        this.cursor.style.height = `${instances.height.current}px`;
        this.cursor.style.width = `${instances.width.current}px`;
        this.cursor.style.borderRadius = `${instances.radius.current}px`;
        this.cursor.style.margin = this.focusedElement ? '0 0 0 5px' : '-20px 0 0 -20px';
        this.cursor.style.transform = `translate3d(${instances.x.current}px, ${
            instances.y.current
        }px, 0) rotateX(${instances.x.velocity / 2}deg) rotateY(${
            instances.y.velocity / 2
        }deg)`;
    }

    // styles
    // prettier-ignore
    private circle_default() {
        this.cursor.style.zIndex        = '-1';
        this.cursor.style.top           = '50%';
        this.cursor.style.left          = '50%';
        this.cursor.style.pointerEvents = 'none';
        this.cursor.style.mixBlendMode  = 'multiply';
        this.cursor.style.position      = 'absolute';
        this.cursor.style.background    = this.options.bg;
        this.cursor.style.margin        = this.focusedElement ? '0 0 0 5px' : '-20px 0 0 -20px';
        this.cursor.style.opacity       = this.options.opacity;
        this.cursor.style.width         = `${this.options.size}px`;
        this.cursor.style.height        = `${this.options.size}px`;
        this.cursor.style.borderRadius  = `${this.options.radius}`;
    }
}
