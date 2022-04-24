
class Blobify {

    public readonly defaultOptions = {};

    constructor(options = {}) {

        // Merge default configuration
        Object.assign({}, this.defaultOptions, options)
    }
}

export default Blobify;
