async function svgStringToPngBase64(page, svgString) {
    try {
        // Передаем SVG напрямую в evaluate
        const pngBase64 = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                // Создаем canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Получаем SVG элемент из DOM
                const svgElement = document.querySelector('.popup-qrc__value svg');
                if (!svgElement) {
                    reject('SVG not found');
                    return;
                }

                const svgString = svgElement.outerHTML;

                // Парсим ширину и высоту из SVG
                const widthMatch = svgString.match(/width="([\d.]+)"/);
                const heightMatch = svgString.match(/height="([\d.]+)"/);
                canvas.width = widthMatch ? parseFloat(widthMatch[1]) : 240;
                canvas.height = heightMatch ? parseFloat(heightMatch[1]) : 240;

                // Создаем Image
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const pngBase64 = canvas.toDataURL('image/png');
                    resolve(pngBase64);
                };
                img.onerror = (e) => reject(e);

                // Кодируем SVG в base64
                const svg64 = btoa(unescape(encodeURIComponent(svgString)));
                img.src = 'data:image/svg+xml;base64,' + svg64;
            });
        });

        return pngBase64;
    } catch (err) {
        console.error('SVG conversion error:', err);
        return null;
    }
}

module.exports = { svgStringToPngBase64 };