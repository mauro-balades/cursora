// @ts-ignore
import { default as Kinet } from "kinet";

export default class Blobify {
    public static readonly types = {
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
    };

    public readonly defaultOptions = {
        size: 40,
        bg: "#dee2e6",
        opacity: 1,
        type: Blobify.types.normal,
        dot: "#000",
        magnetic: false,
        hoverOffset: {
            x: 16,
            y: 16,
        },
    };

    private readonly focusableElements =
        "[data-blobify], a:not([data-no-blobify]), button:not([data-no-blobify]), [data-blobify-tooltip]";
    private cursor: HTMLDivElement;
    private kinet: Kinet;

    private focusedElement: HTMLElement | null = null;
    private options: any;

    private globalStyles: HTMLStyleElement;
    private readonly dot: any = () =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill-rule="evenodd" fill="${this.options.dot}"/></svg>`;

    private magnet_effect: boolean = false;

    constructor(options = {}) {
        // Merge default configuration
        this.options = Object.assign({}, this.defaultOptions, options);

        // Create a new HTML element and append it to the document's body
        this.cursor = document.createElement("div");
        document.body.appendChild(this.cursor);

        // Check if the type preset is valid
        if (
            this.options.type["acceleration"] === undefined ||
            this.options.type["friction"] === undefined
        ) {
            console.error("Type is not valid");
        }

        // Create global styles
        this.globalStyles = document.createElement("style");
        this.globalStyles.setAttribute("data-blobify-global-styles", "");
        document.head.appendChild(this.globalStyles);

        // Style the cursor
        this.cursor_dot();
        this.circle_default();

        this.kinet = new Kinet({
            ...this.options.type,
            names: ["x", "y", "height", "width", "radius", "opacity"],
        });

        // set default variables
        this.kinet.set("width", this.options.size);
        this.kinet.set("height", this.options.size);
        this.kinet.set("radius", this.options.size / 2);
        this.kinet.set("x", 0);
        this.kinet.set("y", -window.innerHeight);
        this.kinet.set("opacity", this.options.opacity);

        // set handler on kinet tick event
        this.kinet.on("tick", this.kinet_tick.bind(this));

        // add event listeners
        document.addEventListener("mousemove", this.mousemove.bind(this));
        document.addEventListener("mouseover", this.mouseover.bind(this));

        document.addEventListener("mouseenter", this.mouseenter.bind(this));
        document.addEventListener("mouseleave", this.mouseleave.bind(this));

        document.addEventListener("mouseleave", this.mouseleave.bind(this));
        document.addEventListener("mouseup", this.mouseup.bind(this));
        document.addEventListener("mousedown", this.mousedown.bind(this));
    }

    // Events

    private mouseup(e: MouseEvent) {
        if (!this.focusedElement) {
            this.kinet.animate("height", this.options.size);
            this.kinet.animate("width", this.options.size);

            this.mousemove(e); // Update the location
        }
    }

    private mousedown(e: MouseEvent) {
        if (!this.focusedElement) {
            let s = this.options.size - (this.options.size / 4);
            this.kinet.animate("height", s);
            this.kinet.animate("width", s);

            this.mousemove(e, s); // Update the location
        }
    }

    private mouseenter() {
        this.kinet.animate("opacity", this.options.opacity);
    }

    private mouseleave() {
        this.kinet.animate("opacity", 0);
    }

    private mousemove(event: MouseEvent, customSize: number | undefined = undefined) {
        const localX = event.clientX;
        const localY = event.clientY;

        if (!this.focusedElement) {
            this.kinet.animate("x", localX - (customSize ?? this.options.size) / 2);
            this.kinet.animate("y", localY - (customSize ?? this.options.size) / 2);
        } else {
            this.magnet_effect = false;

            let element = this.focusedElement as HTMLElement;

            // @ts-ignore
            const { width, height, x, y } = element.getBoundingClientRect();

            // TODO: allow customization for offsets
            let offset = 15;

            // prettier-ignore
            if (event.clientX > (x + width)  ||
                event.clientY > (y + height) ||
                event.clientX <( x - offset) ||
                event.clientY < (y - offset)  ) {

                this.circle_default();

                this.kinet.animate("x", localX - ( this.options.size / 2 ));
                this.kinet.animate("y", localY - ( this.options.size / 2 ));

                this.kinet.animate("height", this.options.size);
                this.kinet.animate("width", this.options.size);

                this.kinet.set("radius", this.options.size / 2);
                this.cursor_dot();

                this.focusedElement = null;
            }
        }
    }

    private mouseover(event: MouseEvent) {
        const element = (event.target as HTMLElement).closest(
            this.focusableElements
        ) as HTMLElement | null;

        if (element) {
            const { left } = element.getBoundingClientRect();

            let radius_attr = element.getAttribute("data-blobify-radius");
            let radius = radius_attr
                ? parseInt(radius_attr)
                : this.options.size / 2;

            let h = 16,
                w = 16;

            this.focusedElement = element;

            this.kinet.animate("x", left - w / 2);
            this.kinet.animate("y", element.offsetTop - h / 2);
            this.kinet.animate(
                "width",
                element.offsetWidth + this.options.hoverOffset.x
            );
            this.kinet.animate(
                "height",
                element.offsetHeight + this.options.hoverOffset.y
            );

            this.kinet.set("radius", radius);
            this.cursor_dot(true);

            if (
                !this.magnet_effect &&
                (this.options.magnetic ||
                    element.hasAttribute("data-blobify-magnetic"))
            ) {
                this.magnet_effect = true;

                element.addEventListener("mousemove", (e) => {
                    const el_pos = element.getBoundingClientRect();
                    const el_x = e.pageX - el_pos.left - el_pos.width / 2;
                    const el_y = e.pageY - el_pos.top - el_pos.height / 2;

                    this.kinet.animate(
                        "x",
                        el_pos.left - this.options.hoverOffset.x / 2
                    );
                    this.kinet.animate(
                        "y",
                        el_pos.top -
                            el_pos.height / 2 +
                            this.options.hoverOffset.y * 3
                    );

                    element.style.transform = `translate(${
                        el_x - this.options.hoverOffset.x / 2
                    }px, ${el_y - this.options.hoverOffset.y / 2}px)`;
                });

                element.addEventListener("mouseout", (e) => {
                    element.style.transform = `translate(0px, 0px)`;
                    this.cursor.style.transform = "rotate(0)";
                });
            }
        }
    }

    // Kinet events
    private kinet_tick(instances: any) {
        this.cursor.style.height = `${instances.height.current}px`;
        this.cursor.style.width = `${instances.width.current}px`;
        this.cursor.style.borderRadius = `${instances.radius.current}px`;

        this.cursor.style.top = `${instances.y.current}px`;
        this.cursor.style.left = `${instances.x.current}px`;

        this.cursor.style.opacity = instances.opacity.current;
    }

    // styles
    // prettier-ignore
    private circle_default() {
        this.cursor.style.zIndex        = '-1';
        this.cursor.style.top           = '-100px';
        this.cursor.style.left          = '50%';
        this.cursor.style.cursor        = 'none';
        this.cursor.style.pointerEvents = 'none';
        this.cursor.style.position      = 'absolute';
        this.cursor.style.overflow      = 'visible';
        this.cursor.style.mixBlendMode  = 'multiply';
        this.cursor.style.willChange    = 'transform';
        this.cursor.style.background    = this.options.bg;
        this.cursor.style.opacity       = this.options.opacity;
        this.cursor.style.width         = `${this.options.size}px`;
        this.cursor.style.height        = `${this.options.size}px`;
        this.cursor.style.borderRadius  = `${this.options.size / 2}`;
    }

    private cursor_dot(hidden: boolean = false) {
        this.globalStyles.innerHTML = "";
        this.globalStyles.appendChild(
            document.createTextNode("* {cursor: inherit}")
        );

        if (!hidden) {
            this.globalStyles.appendChild(
                document.createTextNode(
                    `html { cursor: url(data:image/svg+xml;base64,${btoa(
                        this.dot()
                    )}) 4 4, auto;}`
                )
            );

            return;
        }

        this.globalStyles.appendChild(
            document.createTextNode(`html { cursor: none; }`)
        );
    }
}
