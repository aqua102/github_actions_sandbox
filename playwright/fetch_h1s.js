const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  let browser;
  let exitCode = 0;
  try {
    // Run headless for CI
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    console.log('Navigating to Yahoo Finance');
    // Use DOMContentLoaded to avoid waiting for long-running network requests,
    // then wait specifically for the target selector.
    await page.goto('https://finance.yahoo.com/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log('DOM content loaded');

    // Wait for page body and then for the specific headline selector
    await page.waitForSelector('body', { timeout: 60000 });
    try {
      await page.waitForSelector('a.hyperlink-wrapper h3', { timeout: 120000 });
    } catch (e) {
      console.warn('Target selector a.hyperlink-wrapper h3 not found within timeout');
    }

    console.log('Searching for a.hyperlink-wrapper h3 elements');
    const headlines = await page.locator('a.hyperlink-wrapper h3').allTextContents();

    const bodyText = headlines.join('\n');

    fs.writeFileSync('h3s.txt', bodyText, 'utf8');
    console.log('WROTE h3s.txt with', headlines.length, 'entries');

    // also write to CI artifacts directory if present
    try {
      fs.writeFileSync('gh-artifacts/h1s.txt', bodyText, 'utf8');
      console.log('WROTE gh-artifacts/h1s.txt');
    } catch (e) {
      // ignore if directory doesn't exist
    }

    exitCode = 0;
  } catch (err) {
    console.error('Error fetching page:', err);
    try { fs.writeFileSync('h3s.txt', 'ERROR: ' + String(err), 'utf8'); } catch (e) {}
    exitCode = 2;
  } finally {
    if (browser) await browser.close().catch(() => {});
    process.exit(exitCode);
  }
})();
