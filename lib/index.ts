// @ts-ignore
import { default as Kinet } from "kinet";
import { BlockScopeAwareRuleWalker } from "tslint";
import { textChangeRangeIsUnchanged } from "typescript";

export default class Blobify {

    public readonly types = {
        normal: {
            acceleration: 0.1,
            friction: 0.35,
        },
        bouncy: {
            acceleration: 0.1,
            friction: 0.28,
        },
        slow: {
            acceleration: 0.06,
            friction: 0.35,
        },
    }

    public readonly defaultOptions = {
        size: 40,
        bg: "#dee2e6",
        radius: 20,
        opacity: 1,
        type: this.types.normal,
        dotColour: "#000"
    };

    private readonly focusableElements =
        "[data-blobify], a:not([data-no-blobify]), button:not([data-no-blobify]), [data-blobify-tooltip]";
    private cursor: HTMLDivElement;
    private kinet: Kinet;

    private focusedElement: HTMLElement | null = null;
    private options: any;

    private globalStyles: HTMLStyleElement;
    private readonly dot: any = (colour: string = '#000') => `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill-rule="evenodd" fill="${colour}"/></svg>`;

    constructor(options = {}) {
        // Merge default configuration
        this.options = Object.assign({}, this.defaultOptions, options);

        // Create a new HTML element and append it to the document's body
        this.cursor = document.createElement("div");
        document.body.appendChild(this.cursor);

        // Check if the type preset is valid
        if (this.options.type['acceleration'] === undefined ||
            this.options.type['friction'] === undefined) {
                console.error('Type is not valid')
        }

        // Create global styles
        this.globalStyles = document.createElement('style');
        this.globalStyles.setAttribute('data-blobify-global-styles', '');
        document.head.appendChild(this.globalStyles);

        // Style the cursor
        this.cursor_dot()
        this.circle_default();

        this.kinet = new Kinet({
            ...this.options.type,
            names: ["x", "y", "height", "width", "radius"],
        });

        // set default variables
        this.kinet.set("width",  this.options.size);
        this.kinet.set("height", this.options.size);
        this.kinet.set("radius", this.options.size / 2);
        this.kinet.set("x", 0);
        this.kinet.set("y", -window.innerHeight);

        // set handler on kinet tick event
        this.kinet.on("tick", this.kinet_tick.bind(this));

        // add event listeners
        document.addEventListener("mousemove", this.mousemove.bind(this));
        document.addEventListener("mouseover", this.mouseover.bind(this));
    }

    // Events

    private mousemove(event: MouseEvent) {
        if (!this.focusedElement) {
            this.kinet.animate("x", event.clientX - window.innerWidth / 2);
            this.kinet.animate("y", event.clientY - window.innerHeight / 2);
        } else {
            // @ts-ignore
            let element = this.focusedElement as HTMLElement;

            // @ts-ignore
            console.log(element)
            const { width, height, x, y } = element.getBoundingClientRect();

            // prettier-ignore
            if (event.clientX > (x + width)  ||
                event.clientY > (y + height) ||
                event.clientX < x            ||
                event.clientY < y            ) {
                this.circle_default();

                this.kinet.animate("x", event.clientX - window.innerWidth / 2);
                this.kinet.animate("y", event.clientY - window.innerHeight / 2);

                this.kinet.animate("height", this.options.size);
                this.kinet.animate("width", this.options.size);

                this.kinet.set("radius", this.options.radius);

                this.focusedElement = null;
                this.cursor_dot();
            }
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
            this.cursor_dot(true);
        }
    }

    // Kinet events
    private kinet_tick(instances: any) {
        this.cursor.style.height = `${instances.height.current}px`;
        this.cursor.style.width = `${instances.width.current}px`;
        this.cursor.style.borderRadius = `${instances.radius.current}px`;
        this.cursor.style.margin = this.focusedElement ? '0 0 0 5px' : '-20px 0 0 -15px';
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
        this.cursor.style.cursor        = 'none';
        this.cursor.style.pointerEvents = 'none';
        this.cursor.style.mixBlendMode  = 'multiply';
        this.cursor.style.position      = 'absolute';
        this.cursor.style.background    = this.options.bg;
        this.cursor.style.margin        = this.focusedElement ? '0 0 0 5px' : '-20px 0 0 -15px';
        this.cursor.style.opacity       = this.options.opacity;
        this.cursor.style.width         = `${this.options.size}px`;
        this.cursor.style.height        = `${this.options.size}px`;
        this.cursor.style.borderRadius  = `${this.options.radius}`;
    }

    private cursor_dot(hidden: boolean = false) {
        this.globalStyles.innerHTML = "";
        this.globalStyles.appendChild(
            document.createTextNode('* {cursor: inherit}')
        );

        if (!hidden) {
            this.globalStyles.appendChild(
                document.createTextNode(
                    `html { cursor: url(data:image/svg+xml;base64,${btoa(
                        this.dot(this.options.dotColour)
                    )}) 4 4, auto;}`
                )
            );

            return
        }

        this.globalStyles.appendChild(
            document.createTextNode(
                `html { cursor: none; }`
            )
        );
    }
}
