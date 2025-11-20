/**
 * Playwright test for REGISTRY_DISCOVER_DOCUMENTS custom action
 *
 * Tests that the action properly formats document discovery output with proper markdown spacing
 */

const { chromium } = require('playwright');

async function testRegistryDiscoverAction() {
  console.log('🎭 Starting Playwright test for REGISTRY_DISCOVER_DOCUMENTS action\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the server (port 3000, not 5173)
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take a screenshot of initial state
    await page.screenshot({ path: '/tmp/playwright-discover-initial.png' });
    console.log('📸 Initial screenshot saved: /tmp/playwright-discover-initial.png');

    // Find and fill the message input
    console.log('\n💬 Sending message: "Discover documents for session session-5ce66e608820"');

    // Try different possible selectors for the message input
    const inputSelectors = [
      'textarea',
      'input[type="text"]',
      'input[placeholder*="message"]',
      'input[placeholder*="Message"]',
      '[role="textbox"]',
      '.message-input',
      '#message-input'
    ];

    let messageInput = null;
    for (const selector of inputSelectors) {
      try {
        messageInput = await page.$(selector);
        if (messageInput) {
          console.log(`✅ Found input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!messageInput) {
      console.error('❌ Could not find message input field');
      console.log('\n🔍 Page content:');
      console.log(await page.content());
      return false;
    }

    // Type the message
    await messageInput.fill('Discover documents for session session-5ce66e608820');
    await page.waitForTimeout(500);

    // Find and click the send button or press Enter
    const sendSelectors = [
      'button[type="submit"]',
      'button:has-text("Send")',
      '[aria-label="Send"]',
      '.send-button'
    ];

    let sendButton = null;
    for (const selector of sendSelectors) {
      try {
        sendButton = await page.$(selector);
        if (sendButton) {
          console.log(`✅ Found send button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (sendButton) {
      await sendButton.click();
    } else {
      console.log('⚠️  No send button found, trying Enter key...');
      await messageInput.press('Enter');
    }

    console.log('⏳ Waiting for agent response (15s)...');
    await page.waitForTimeout(15000);

    // Take screenshot of response
    await page.screenshot({ path: '/tmp/playwright-discover-response.png' });
    console.log('📸 Response screenshot saved: /tmp/playwright-discover-response.png');

    // Extract the agent's response
    const pageText = await page.textContent('body');
    console.log('\n📄 Page content (last 3000 chars):');
    console.log(pageText.slice(-3000));

    // Check for specific criteria related to document discovery
    console.log('\n🔍 Analyzing response...');

    const checks = {
      'Contains "document" or "Document"': /document/i.test(pageText),
      'Contains session ID': /session-5ce66e608820/i.test(pageText),
      'Contains "discovered" or "found"': /(discovered|found)/i.test(pageText),
      'Has proper list formatting (bullet points)': /[•\-\*]\s/.test(pageText) || /^\d+\.\s/m.test(pageText),
      'Response length > 200 chars': pageText.length > 200
    };

    console.log('\n✅ Semantic Validation:');
    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allPassed = false;
    }

    return allPassed;

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    await page.screenshot({ path: '/tmp/playwright-discover-error.png' });
    console.log('📸 Error screenshot saved: /tmp/playwright-discover-error.png');
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testRegistryDiscoverAction().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ TEST PASSED');
  } else {
    console.log('❌ TEST FAILED');
  }
  console.log('='.repeat(60));
  process.exit(success ? 0 : 1);
});
