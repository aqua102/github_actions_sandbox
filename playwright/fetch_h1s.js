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

    // Prefer content inside elements with class "container" (common in SPA layouts)
    console.log('Searching for .container elements to scrape');
    const containers = await page.$$eval('.container', els => els.map(e => e.innerHTML).filter(Boolean));

    let bodyHtml = '';
    let source = '';

    if (containers && containers.length > 0) {
      source = '.container';
      bodyHtml = containers.join('\n');
      console.log('Found', containers.length, '.container elements; using their HTML');
    } else {
      source = 'body';
      bodyHtml = await page.$eval('body', el => el.innerHTML);
      console.log('No .container elements found; falling back to body');
    }

    fs.writeFileSync('body.txt', `<!-- source: ${source} -->\n` + bodyHtml, 'utf8');
    console.log('WROTE body.txt length', bodyHtml.length);

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error fetching page:', err);
    try { fs.writeFileSync('body.txt', 'ERROR: ' + String(err), 'utf8'); } catch (e) {}
    process.exit(2);
  }
})();
