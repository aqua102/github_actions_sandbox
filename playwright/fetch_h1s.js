const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.cnn.com', { waitUntil: 'domcontentloaded' });
    const h1s = await page.$$eval('h1', els => els.map(e => e.innerText.trim()).filter(Boolean));
    const out = h1s.join('\n');
    fs.writeFileSync('h1s.txt', out, 'utf8');
    console.log('WROTE h1s.txt with', h1s.length, 'entries');
    await browser.close();
  } catch (err) {
    console.error('Error fetching h1s:', err);
    process.exit(2);
  }
})();
