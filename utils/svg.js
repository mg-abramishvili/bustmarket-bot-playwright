const sharp = require('sharp');

async function svgStringToPngBase64(svgString) {
    try {
        const pngBuffer = await sharp(Buffer.from(svgString))
            .png()
            .toBuffer();
        return 'data:image/png;base64,' + pngBuffer.toString('base64');
    } catch (err) {
        throw err;
    }
}

module.exports = { svgStringToPngBase64 };