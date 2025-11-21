/**
 * Test Case 1.1.1: List All Sessions (Empty State)
 *
 * MCP Tool: list_sessions
 * Precondition: Fresh database or no sessions exist
 * Expected Result: Empty list or "No sessions found"
 *
 * Success Criteria:
 * - Tool returns valid response
 * - No errors thrown
 * - Clear empty state message or empty array
 */

import { chromium } from 'playwright';

async function test_1_1_1_list_sessions_empty() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1.1.1: List All Sessions (Empty State)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to app
    console.log('📍 Step 1: Navigate to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/test-1.1.1-initial.png' });
    console.log('   ✅ Page loaded\n');

    // Dismiss onboarding tour
    console.log('📍 Step 2: Dismiss onboarding tour');
    try {
      const skipButton = await page.$('button[data-action="skip"]');
      if (skipButton) {
        await skipButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ Tour dismissed\n');
      }
    } catch (e) {
      console.log('   ℹ️  No tour found\n');
    }

    // Open chat with agent
    console.log('📍 Step 3: Open chat with Regen Registry Assistant');
    const agentCard = await page.$('[data-testid="agent-card"]');
    if (agentCard) {
      await agentCard.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Chat opened\n');
    }
    await page.screenshot({ path: '/tmp/test-1.1.1-chat-opened.png' });

    // Send message to list sessions
    console.log('📍 Step 4: Send message "List all sessions"');
    const messageInput = await page.$('textarea[placeholder*="Type"]') || await page.$('textarea');
    if (!messageInput) {
      throw new Error('Could not find message input');
    }

    await messageInput.click();
    await page.waitForTimeout(300);
    await messageInput.fill('List all sessions');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/test-1.1.1-message-typed.png' });
    console.log('   ✅ Message typed\n');

    // Send message
    console.log('📍 Step 5: Click send button');
    const sendButton = await page.$('button[type="submit"]');
    if (sendButton) {
      await sendButton.click();
      console.log('   ✅ Message sent\n');
    } else {
      await messageInput.press('Enter');
      console.log('   ✅ Message sent (via Enter)\n');
    }

    // Wait for response
    console.log('📍 Step 6: Wait for agent response (10s)');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: '/tmp/test-1.1.1-response.png' });
    console.log('   ✅ Response received\n');

    // Extract response text
    const pageText = await page.textContent('body');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('RESPONSE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Extract last 1500 characters for analysis
    const responseText = pageText.slice(-1500);
    console.log('📄 Response (last 1500 chars):');
    console.log('───────────────────────────────────────────────────────────');
    console.log(responseText);
    console.log('───────────────────────────────────────────────────────────\n');

    // Check for expected patterns
    const checks = {
      'Contains "session" or "Session"': /session/i.test(responseText),
      'Contains "No sessions" or "empty" or "0"': /(no sessions|empty|0 session)/i.test(responseText),
      'Contains REGISTRY_LIST action badge': /REGISTRY_LIST/i.test(responseText),
      'Response length > 100 chars': responseText.length > 100,
      'No error messages': !/error|failed|exception/i.test(responseText)
    };

    console.log('✅ VALIDATION RESULTS:');
    console.log('───────────────────────────────────────────────────────────');
    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check}`);
      if (!passed) allPassed = false;
    }
    console.log('───────────────────────────────────────────────────────────\n');

    console.log('═══════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✅ TEST 1.1.1 PASSED');
    } else {
      console.log('❌ TEST 1.1.1 FAILED');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('👁️  Browser window is open for visual inspection');
    console.log('📸 Screenshots saved to /tmp/test-1.1.1-*.png');
    console.log('⌨️  Press Ctrl+C when done inspecting\n');

    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    await page.screenshot({ path: '/tmp/test-1.1.1-error.png' });
    console.log('📸 Error screenshot saved\n');
    return false;
  }
  // Browser intentionally left open for inspection
}

// Run the test
test_1_1_1_list_sessions_empty().then(success => {
  // Keep process alive so browser stays open
});
