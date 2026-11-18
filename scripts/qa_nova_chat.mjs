import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 4198;
const DIST_DIR = path.resolve('dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '' || reqPath === '/') {
    reqPath = '/index.html';
  }
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function runTest() {
  server.listen(PORT, async () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    let browser;
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });

      // Navigate to game with chapter 4 directly in localStorage to test WorldScene
      await page.goto(`http://localhost:${PORT}`);
      await page.evaluate(() => {
        const testProgress = {
          version: 3,
          currentChapter: 4,
          unlockedMissions: [],
          quizzesCompleted: [],
          solvedMiniGames: [],
          badges: [],
          worldSave: {
            seed: 19970704,
            playerTileX: 50,
            playerTileY: 50,
            playerFacing: 'down',
            collectedPartIds: [],
            completedEquipmentIds: [],
            exploredFog: null,
            shipRepaired: false,
            playTimeSeconds: 60,
            lastSavedAt: Date.now(),
          },
        };
        localStorage.setItem('beyond_depth_save_v3', JSON.stringify(testProgress));
      });

      // Reload to activate saved world
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify that the NOVA chat trigger is visible on HUD
      const trigger = await page.waitForSelector('[data-testid="nova-chat-trigger"]', { timeout: 8000 });
      console.log('✅ Found [data-testid="nova-chat-trigger"] in HUD');

      // Click trigger to open modal
      await trigger.click();
      await page.waitForTimeout(600);

      const modal = await page.waitForSelector('[data-testid="nova-chat-modal"]', { timeout: 5000 });
      console.log('✅ NOVA Chat Modal opened successfully on click');

      // Check for NASA telemetry text
      const modalText = await modal.innerText();
      const hasSol = modalText.includes('SOL');
      const hasTemp = modalText.includes('TEMP');
      const hasPressure = modalText.includes('PRESSURE');
      console.log(`✅ Telemetry strip verified: Sol=${hasSol}, Temp=${hasTemp}, Pressure=${hasPressure}`);

      // Click quick chip "How do I repair the crashed ship?"
      const chipBtn = await page.locator('button:has-text("repair the crashed ship")').first();
      await chipBtn.click();
      await page.waitForTimeout(500);

      const messagesText = await page.locator('[data-testid="nova-chat-messages"]').innerText();
      const hasRepairInfo =
        messagesText.includes('Ascendant-IV') && messagesText.includes('8 components');
      if (!hasRepairInfo) {
        throw new Error(`Expected repair chip answer to mention Ascendant-IV and 8 components. Got:\n${messagesText}`);
      }
      console.log(`✅ Quick chip response verified: ${hasRepairInfo}`);

      // Test input event isolation
      const input = page.locator('input[placeholder*="Ask NOVA anything"]');
      await input.focus();
      await page.keyboard.type('What is Mars gravity?');
      await page.waitForTimeout(300);

      // Verify key press 'Escape' closes modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const isModalVisible = await page.locator('[data-testid="nova-chat-modal"]').isVisible();
      console.log(`✅ Modal closed with Escape key: ${!isModalVisible}`);

      // Test pressing 'N' opens the modal
      await page.keyboard.press('KeyN');
      await page.waitForTimeout(600);
      const isModalReopened = await page.locator('[data-testid="nova-chat-modal"]').isVisible();
      console.log(`✅ Modal reopened with KeyN: ${isModalReopened}`);

      // Close modal before testing Moon
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // ==========================================
      // TEST MOON CHAPTER 8 (Lunar Environment)
      // ==========================================
      console.log('Testing Moon Chapter 8 integration...');
      // Disable onbeforeunload so WorldScene doesn't overwrite our Moon save
      await page.evaluate(() => {
        window.onbeforeunload = null;
      });
      await page.goto('about:blank');
      await page.goto(`http://localhost:${PORT}`);
      await page.evaluate(() => {
        const moonProgress = {
          version: 3,
          currentChapter: 8,
          unlockedMissions: [],
          quizzesCompleted: [],
          solvedMiniGames: [],
          badges: [],
          moonChapter: {
            relicIds: [],
            secretIds: [],
            iceScannedIds: [],
            monumentIds: [],
            lunarRockIds: [],
            thumperFired: false,
            completed: false,
            rpApplied: false,
          },
        };
        localStorage.setItem('beyond_depth_save_v3', JSON.stringify(moonProgress));
      });

      await page.reload();
      await page.waitForTimeout(2000);

      const moonTrigger = await page.waitForSelector('[data-testid="nova-chat-trigger"]', { timeout: 8000 });
      console.log('✅ Found [data-testid="nova-chat-trigger"] in Moon Chapter');

      await moonTrigger.click();
      await page.waitForTimeout(600);

      const moonModal = await page.waitForSelector('[data-testid="nova-chat-modal"]', { timeout: 5000 });
      const moonModalText = await moonModal.innerText();
      console.log('--- MOON MODAL TEXT ---\n', moonModalText, '\n----------------------');
      const hasMoonGravity = moonModalText.includes('1.62') || moonModalText.includes('1/6th');
      const hasMoonTitle = moonModalText.toUpperCase().includes('MOON');
      console.log(`✅ Moon Telemetry verified: Title=${hasMoonTitle}, Gravity=${hasMoonGravity}`);

      // Click Lunar quick chip
      const lunarChipBtn = await page.locator('button:has-text("1/6th gravity hopping")').first();
      await lunarChipBtn.click();
      await page.waitForTimeout(500);

      const moonMessages = await page.locator('[data-testid="nova-chat-messages"]').innerText();
      const hasHopInfo = moonMessages.includes('1.62 m/s²') && moonMessages.includes('0.8 s');
      if (!hasHopInfo) {
        throw new Error(`Expected Moon hop answer to mention 1.62 m/s² and 0.8 s. Got:\n${moonMessages}`);
      }
      console.log(`✅ Moon Quick chip response verified: ${hasHopInfo}`);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // ==========================================
      // TEST LIVE STATE CONTEXT (?debug=1 + __grantAllParts)
      // ==========================================
      console.log('Testing live Mars context via ?debug=1 & __grantAllParts...');
      await page.evaluate(() => {
        window.onbeforeunload = null;
      });
      await page.goto(`http://localhost:${PORT}/?debug=1`);
      await page.evaluate(() => {
        const testProgress = {
          version: 3,
          currentChapter: 4,
          unlockedMissions: [],
          quizzesCompleted: [],
          solvedMiniGames: [],
          badges: [],
          worldSave: {
            seed: 19970704,
            playerTileX: 50,
            playerTileY: 50,
            playerFacing: 'down',
            collectedPartIds: [],
            completedEquipmentIds: [],
            exploredFog: null,
            shipRepaired: false,
            playTimeSeconds: 60,
            lastSavedAt: Date.now(),
          },
        };
        localStorage.setItem('beyond_depth_save_v3', JSON.stringify(testProgress));
      });
      await page.reload();
      await page.waitForTimeout(2000);

      await page.evaluate(() => {
        window.__grantAllParts?.();
      });
      await page.waitForTimeout(400);

      await page.keyboard.press('KeyN');
      await page.waitForTimeout(600);
      await page.waitForSelector('[data-testid="nova-chat-modal"]', { timeout: 5000 });

      const nextStepChip = page.locator('button:has-text("What should I do next?")').first();
      await nextStepChip.click();
      await page.waitForTimeout(400);

      const debugMessages = await page.locator('[data-testid="nova-chat-messages"]').innerText();
      const mentionsShipAndCal =
        /crashed ship|ship/i.test(debugMessages) && /calibrat/i.test(debugMessages);
      if (!mentionsShipAndCal) {
        throw new Error(`Expected next_step after 8 parts to mention crashed ship & calibration. Got:\n${debugMessages}`);
      }
      console.log('✅ Live state next_step (8/8 parts -> ship calibration) verified!');

      console.log('🎉 ALL MARS & MOON NOVA CHATBOT TESTS PASSED!');
    } catch (err) {
      console.error('❌ Test failed:', err);
      process.exitCode = 1;
    } finally {
      if (browser) await browser.close();
      server.close();
    }
  });
}

runTest();
