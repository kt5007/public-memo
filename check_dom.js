const puppeteer = require('puppeteer');

(async () => {
    // Puppeteerをヘッドレスモードで起動
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });

    let lastHeight = await page.evaluate('document.body.scrollHeight');

    while (true) {
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒待機

        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === lastHeight) {
            break;
        }
        lastHeight = newHeight;
    }

    // DOMの要素を確認（例：特定のIDで始まる要素を確認）
    const newElements = await page.$$eval('[id^="target-id"]', elements => elements.length);

    if (newElements > 0) {
        console.log(`新しい要素が${newElements}個追加されました`);
    } else {
        console.log('新しい要素は追加されていません');
    }

    await browser.close();
})();