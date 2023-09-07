const fs = require('fs');
const path = require('path');

const { nanoid } = require('nanoid');

const isValidURL = (url) => {
    let urlRegEx = new RegExp(
        '^' +
            // protocol identifier (optional)
            // short syntax // still required
            '(?:(?:(?:https?|ftp):)?\\/\\/)' +
            // user:pass BasicAuth (optional)
            '(?:\\S+(?::\\S*)?@)?' +
            '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broadcast addresses
            // (first & last IP address of each class)
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
            '|' +
            // host & domain names, may end with dot
            // can be replaced by a shortest alternative
            // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
            '(?:' +
            '(?:' +
            '[a-z0-9\\u00a1-\\uffff]' +
            '[a-z0-9\\u00a1-\\uffff_-]{0,62}' +
            ')?' +
            '[a-z0-9\\u00a1-\\uffff]\\.' +
            ')+' +
            // TLD identifier name, may end with dot
            '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)' +
            ')' +
            // port number (optional)
            '(?::\\d{2,5})?' +
            // resource path (optional)
            '(?:[/?#]\\S*)?' +
            '$',
        'i',
    );

    return urlRegEx.test(url);
};

const isJSONParsable = (input) => {
    try {
        JSON.parse(input);
        return true;
    } catch (err) {
        return false;
    }
};

const isValidDateTime = (datetime) => {
    const timestamp = new Date(datetime).getTime();

    // Return false if the timestamp is not a number.
    if (isNaN(timestamp)) return false;

    return true;
};

const getImageFormatFromBase64Url = (image) => {
    const imageFormat = image.match(/^data:image\/(\w+);base64,/)[1];
    return imageFormat;
};

const saveBase64MediaToFileSystem = (base64Images = null) => {
    if (base64Images === null || base64Images === []) return null;

    const prefix = 'image-' + nanoid();
    const outputFolder = path.join(__dirname, '..', 'public', 'media');

    let images = [];
    for (let i = 0; i < base64Images.length; i++) {
        const base64Image = base64Images[i];

        // Remove the "data:image/png;base64," prefix
        const data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Create a buffer from the base64 data
        const buffer = Buffer.from(data, 'base64');

        // Create the output file location
        const format = getImageFormatFromBase64Url(base64Image);
        const filename = `${prefix}-file-${i + 1}.${format}`;
        const outputPath = path.join(outputFolder, filename);

        fs.writeFileSync(outputPath, buffer);
        images.push(filename);
    }

    return images;
};

module.exports = {
    isValidURL,
    isJSONParsable,
    isValidDateTime,
    saveBase64MediaToFileSystem,
};
