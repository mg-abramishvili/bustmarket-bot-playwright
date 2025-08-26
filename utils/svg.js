async function svgStringToPngBase64(page, svgString) {
    try {
        const pngBase64 = await page.evaluate((svgStr) => {
            return new Promise((resolve, reject) => {
                // Создаем canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Парсим ширину и высоту из SVG
                const widthMatch = svgStr.match(/width="([\d.]+)"/);
                const heightMatch = svgStr.match(/height="([\d.]+)"/);
                canvas.width = widthMatch ? parseFloat(widthMatch[1]) : 240;
                canvas.height = heightMatch ? parseFloat(heightMatch[1]) : 240;

                // Создаем Image
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const pngBase64 = canvas.toDataURL('image/png'); // base64 PNG
                    resolve(pngBase64);
                };
                img.onerror = (e) => reject(e);

                // Кодируем SVG в base64
                const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
                img.src = 'data:image/svg+xml;base64,' + svg64;
            });
        }, svgString);

        return pngBase64;
    } catch (err) {
        return null;
    }
}

module.exports = {svgStringToPngBase64};