const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    console.log('Navigating to cnn.com');
    // Give the page more time to load network resources and dynamic content
    await page.goto('https://www.cnn.com', { waitUntil: 'networkidle', timeout: 120000 });

    // Ensure the body is present and wait for any remaining network activity
    await page.waitForSelector('body', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    // Small additional pause to let client-side rendering finish
    await page.waitForTimeout(2000);

    // Capture all H1 texts
    const h1s = await page.$$eval('h1', els => els.map(e => e.innerText.trim()).filter(Boolean));
    fs.writeFileSync('h1s.txt', h1s.join('\n'), 'utf8');
    console.log('WROTE h1s.txt with', h1s.length, 'entries');

    // Capture body HTML/text
    const bodyHtml = await page.$eval('body', el => el.innerHTML);
    fs.writeFileSync('body.txt', bodyHtml, 'utf8');
    console.log('WROTE body.txt length', bodyHtml.length);

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error fetching page:', err);
    try { fs.writeFileSync('body.txt', 'ERROR: ' + String(err), 'utf8'); } catch (e) {}
    process.exit(2);
  }
})();
