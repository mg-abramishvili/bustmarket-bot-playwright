const sharp = require('sharp');

async function svgStringToPngBase64(svgString) {
    try {
        const pngBuffer = await sharp(Buffer.from(svgString))
            .resize(240, 240)
            .png()
            .toBuffer();
        return 'data:image/png;base64,' + pngBuffer.toString('base64');
    } catch (err) {
        return null;
    }
}

module.exports = { svgStringToPngBase64 };