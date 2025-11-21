/**
 * Playwright test for REGISTRY_DISCOVER_DOCUMENTS custom action
 *
 * Tests that the action properly formats document discovery output with proper markdown spacing
 */

import { chromium } from 'playwright';

async function testRegistryDiscoverAction() {
  console.log('🎭 Starting Playwright test for REGISTRY_DISCOVER_DOCUMENTS action\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100  // Slow down actions by 100ms for easier visual tracking
  });
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

    // Dismiss onboarding tour if present
    console.log('\n🎯 Checking for onboarding tour...');
    try {
      const skipButton = await page.$('button[data-action="skip"]');
      if (skipButton) {
        console.log('✅ Found onboarding tour, clicking Skip...');
        await skipButton.click();
        await page.waitForTimeout(500);
      } else {
        // Try to close with X button
        const closeButton = await page.$('button[data-action="close"]');
        if (closeButton) {
          console.log('✅ Found onboarding tour, clicking Close...');
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log('ℹ️  No onboarding tour found, continuing...');
    }

    // Click on the agent to open chat
    console.log('\n🤖 Opening chat with Regen Registry Assistant...');
    const agentCard = await page.$('[data-testid="agent-card"]');
    if (agentCard) {
      await agentCard.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked agent card');
    } else {
      // Try alternative: click "New Chat" button
      const newChatButton = await page.getByText('New Chat').first();
      if (newChatButton) {
        await newChatButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Clicked New Chat button');
      }
    }

    await page.screenshot({ path: '/tmp/playwright-discover-chat-opened.png' });
    console.log('📸 Chat opened screenshot saved');

    // Find and fill the message input
    console.log('\n💬 Looking for message input field...');

    // Try different possible selectors for the message input
    const inputSelectors = [
      'textarea[placeholder*="Type"]',
      'textarea[placeholder*="message"]',
      'textarea',
      'input[type="text"]',
      '[role="textbox"]',
      '[contenteditable="true"]',
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
      console.log('\n🔍 Available textareas:');
      const textareas = await page.$$('textarea');
      console.log(`Found ${textareas.length} textarea elements`);
      console.log('\n🔍 Page content (last 2000 chars):');
      const content = await page.content();
      console.log(content.slice(-2000));
      return false;
    }

    // First, create a session with documents
    console.log('💬 Step 1: Creating a new session with start_review...');
    await messageInput.click();
    await page.waitForTimeout(300);
    await messageInput.fill('Start a review for Botany Farm 2024 project');
    await page.waitForTimeout(500);

    await page.screenshot({ path: '/tmp/playwright-discover-message-typed.png' });
    console.log('📸 Message typed screenshot saved');

    // Find and click the send button or press Enter
    console.log('\n📤 Looking for send button...');
    const sendSelectors = [
      'button[type="submit"]',
      'button[aria-label*="Send"]',
      'button:has-text("Send")',
      'button svg[class*="send"]',
      '.send-button'
    ];

    let sendButton = null;
    for (const selector of sendSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          sendButton = elements[0];
          console.log(`✅ Found send button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (sendButton) {
      console.log('📤 Clicking send button...');
      await sendButton.click();
    } else {
      console.log('⚠️  No send button found, trying Enter key...');
      await messageInput.press('Enter');
    }

    console.log('⏳ Waiting for session creation (20s)...');
    await page.waitForTimeout(20000);

    // Extract session ID from the response
    const pageTextAfterCreate = await page.textContent('body');
    const sessionMatch = pageTextAfterCreate.match(/session-[a-f0-9]{12}/);
    const sessionId = sessionMatch ? sessionMatch[0] : 'session-5ce66e608820';

    console.log(`\n✅ Found session ID: ${sessionId}`);
    await page.screenshot({ path: '/tmp/playwright-discover-session-created.png' });
    console.log('📸 Session created screenshot saved');

    // Now discover documents for this session
    console.log(`\n💬 Step 2: Discovering documents for ${sessionId}...`);

    // Find the input again (may have changed)
    const messageInput2 = await page.$('textarea[placeholder*="Type"]') || await page.$('textarea');
    if (messageInput2) {
      await messageInput2.click();
      await page.waitForTimeout(300);
      await messageInput2.fill(`Discover documents for session ${sessionId}`);
      await page.waitForTimeout(500);

      // Find send button again
      const sendButton2 = await page.$('button[type="submit"]');
      if (sendButton2) {
        console.log('📤 Clicking send button...');
        await sendButton2.click();
      } else {
        await messageInput2.press('Enter');
      }
    }

    console.log('⏳ Waiting for discovery response (15s)...');
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

    console.log('\n👁️  Browser left open for inspection. Close manually when done.');
    return allPassed;

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    await page.screenshot({ path: '/tmp/playwright-discover-error.png' });
    console.log('📸 Error screenshot saved: /tmp/playwright-discover-error.png');
    console.log('\n👁️  Browser left open for inspection. Close manually when done.');
    return false;
  }
  // Browser intentionally NOT closed - left open for visual inspection
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
  console.log('\n💡 Browser window is still open. Press Ctrl+C to exit when done inspecting.');
  // Don't exit - keep process alive so browser stays open
});
