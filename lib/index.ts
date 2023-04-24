// @ts-ignore
import { default as Kinet } from "kinet";

/**
 * Cursora is a class that creates a cursor effect on HTML elements. It creates an animated
 * blob that follows the cursor or focuses on the element that the cursor is hovering over.
 * It also has an option to enable a magnetic effect.
 *
 * Example usage:
 * ```typescript
 * const options = {
 *   size: 60,
 *   bg: '#ffffff',
 *   opacity: 0.5,
 *   type: Cursora.types.normal,
 *   dot: '#000000',
 *   magnetic: true,
 *   hoverOffset: {
 *     x: 10,
 *     y: 10,
 *   },
 * };
 * const cursora = new Cursora(options);
 * ```
 */
export default class Cursora {
    /**
     * A constant object that holds different types of cursor behavior presets.
     */
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
    /**
     * Default options for the cursor effect.
     */
    public readonly defaultOptions = {
        size: 40,
        bg: "#dee2e6",
        opacity: 1,
        type: Cursora.types.normal,
        dot: "#000",
        magnetic: false,
        hoverOffset: {
            x: 16,
            y: 16,
        },
        zIndex: -1,
        invert: false,
        border: {
            size: 0,
            color: 'black'
        },
        magnetStrength: 0.3
    };
    /**
     * A CSS selector that is used to find focusable elements on the page.
     */
    private readonly focusableElements =
        "[data-cursora], a:not([data-no-cursora]), button:not([data-no-cursora]), [data-cursora-tooltip]";
    /**
     * The HTML element that represents the cursor.
     */
    private cursor: HTMLDivElement;
    /**
     * The Kinet instance that is used to animate the cursor.
     */
    private kinet: Kinet;

    /**
     * The currently focused element.
     */
    private focusedElement: HTMLElement | null = null;
    /**
     * The options for the cursor effect.
     */
    private options: any;

    /**
     * A global style element that is used to apply styles to the page.
     */
    private globalStyles: HTMLStyleElement;
    /**
     * A function that returns an SVG dot element.
     */
    private readonly dot: any = () =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill-rule="evenodd" fill="${this.options.dot}"/></svg>`;

    /**
     * A boolean that determines whether the magnetic effect is enabled or not.
     */
    private magnet_effect: boolean = false;
    /**
     * The background color of the cursor.
     */
    private cursor_bg: string = "";

    constructor(options = {}) {
        // Merge default configuration
        this.options = Object.assign({}, this.defaultOptions, options);
        console.log(this.options);

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
        this.globalStyles.setAttribute("data-cursora-global-styles", "");
        document.head.appendChild(this.globalStyles);

        this.cursor_bg = this.options.bg;

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
            let s = this.options.size - this.options.size / 4;
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

    private mousemove(
        event: MouseEvent,
        customSize: number | undefined = undefined
    ) {
        const localX = event.clientX;
        const localY = event.clientY;

        if (!this.focusedElement) {
            this.kinet.animate(
                "x",
                localX - (customSize ?? this.options.size) / 2
            );
            this.kinet.animate(
                "y",
                localY - (customSize ?? this.options.size) / 2
            );

            this.cursor_bg = this.options.bg;
        } else {
            this.magnet_effect = false;

            let element = this.focusedElement as HTMLElement;

            // @ts-ignore
            const { width, height, x, y } = element.getBoundingClientRect();

            // TODO: allow customization for offsets
            let offset = 15;

            if ((event.clientX > (x + width) ||
                event.clientY > (y + height) ||
                event.clientX < (x - offset) ||
                event.clientY < (y - offset))) {

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
            if (element.hasAttribute("data-cursora-background")) {
                this.cursor_bg = element.getAttribute(
                    "data-cursora-background"
                ) as string;
            }

            const { left, top } = element.getBoundingClientRect();

            let radius_attr = element.getAttribute("data-cursora-radius");
            let radius = radius_attr
                ? parseInt(radius_attr)
                : this.options.size / 2;

            let h = this.options.hoverOffset.y,
                w = this.options.hoverOffset.x;

            this.focusedElement = element;

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
                    element.hasAttribute("data-cursora-magnetic")) 
            ) {
                this.magnet_effect = true;
                const el_pos = element.getBoundingClientRect();
                let magnetStrength = element.hasAttribute("data-cursora-magnet-strength") ?
                    parseFloat(element.getAttribute("data-cursora-magnet-strength") as string) :
                    this.options.magnetStrength

                element.addEventListener("mousemove", (e) => {
                    const el_x = e.pageX - el_pos.left - el_pos.width / 2;
                    const el_y = e.pageY - el_pos.top - el_pos.height / 2;

                    this.kinet.animate(
                        "x",
                        (((el_x - this.options.hoverOffset.x) * magnetStrength) - (this.options.hoverOffset.x / 2) + left)
                    );
                    this.kinet.animate(
                        "y",
                        (((el_y - this.options.hoverOffset.y) * magnetStrength) - (this.options.hoverOffset.x / 2) + top)
                    );

                    element.style.transform = `translate(${
                        (el_x - this.options.hoverOffset.x / 2) * magnetStrength
                    }px, ${(el_y - this.options.hoverOffset.y / 2) * magnetStrength}px)`;
                });

                element.addEventListener("mouseout", (e) => {
                    element.style.transform = `translate(0px, 0px)`;
                    this.cursor.style.transform = "rotate(0)";
                    // this.magnet_effect
                });
            } else {
                this.kinet.animate("x", left - w / 2);
                this.kinet.animate("y", top - h / 2);
            }
        }
    }

    // Kinet events
    private kinet_tick(instances: any) {

        this.cursor.style.background = this.cursor_bg;

        this.cursor.style.height = `${instances.height.current}px`;
        this.cursor.style.width = `${instances.width.current}px`;
        this.cursor.style.borderRadius = `${instances.radius.current}px`;

        this.cursor.style.top = `${instances.y.current}px`;
        this.cursor.style.left = `${instances.x.current}px`;

        this.cursor.style.opacity = instances.opacity.current;
    }

    /**
     * Sets the default cursor style
     */
    // prettier-ignore
    private circle_default() {
        this.cursor.style.zIndex            = this.options.zIndex;
        this.cursor.style.top               = '-100px';
        this.cursor.style.left              = '50%';
        this.cursor.style.cursor            = 'none';
        this.cursor.style.pointerEvents     = 'none';
        this.cursor.style.position          = 'absolute';
        this.cursor.style.overflow          = 'visible';
        this.cursor.style.willChange        = 'transform';
        this.cursor.style.background        = this.options.bg;
        this.cursor.style.opacity           = this.options.opacity;
        this.cursor.style.width             = `${this.options.size}px`;
        this.cursor.style.height            = `${this.options.size}px`;
        this.cursor.style.transition        = `background-color .1s`;
        this.cursor.style.borderRadius      = `${this.options.size / 2}`;

        this.cursor.style.borderStyle       = "solid";
        this.cursor.style.borderColor       = this.options.border.color;
        this.cursor.style.borderWidth       = `${this.options.border.size}px`;

        if (this.options.invert)
            this.cursor.style.mixBlendMode  = 'difference';
    }

    private cursor_dot(hidden: boolean = false) {
        this.globalStyles.innerHTML = "";

        const inheritCursorStyle = document.createTextNode(
            "* { cursor: inherit; }"
        );
        this.globalStyles.appendChild(inheritCursorStyle);

        if (!hidden) {
            const dotSvgBase64 = btoa(this.dot());
            const dotCursorStyle = document.createTextNode(
                `html { cursor: url(data:image/svg+xml;base64,${dotSvgBase64}) 4 4, auto; }`
            );
            this.globalStyles.appendChild(dotCursorStyle);
        } else {
            const noneCursorStyle = document.createTextNode(
                `html { cursor: none; }`
            );
            this.globalStyles.appendChild(noneCursorStyle);
        }
    }
}
