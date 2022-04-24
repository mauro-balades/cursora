
class Blobify {

    public readonly defaultOptions = {
        rect: {
            width: 20,
            height: 20
        },
        radius: 50
    };

    constructor(options = {}) {

        // Merge default configuration
        Object.assign({}, this.defaultOptions, options)
    }

    private createCursor() {

    }

}

export default Blobify;
