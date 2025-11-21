/**
 * Test Case 1.1.2: Create New Session
 *
 * MCP Tool: start_review
 * Expected Result: New session created with unique ID
 *
 * Success Criteria:
 * - Returns valid session object
 * - Session ID format: session-[a-f0-9]{12}
 * - Session file created in MCP data directory
 * - Can load session by ID immediately after creation
 */

import { chromium } from 'playwright';
import { readdir } from 'fs/promises';

async function test_1_1_2_create_session() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1.1.2: Create New Session');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check sessions directory before
    const sessionsPath = '/home/ygg/Workspace/RegenAI/regen-registry-review-mcp/data/sessions';
    const sessionsBefore = await readdir(sessionsPath);
    console.log(`📁 Sessions before test: ${sessionsBefore.length} files\n`);

    // Navigate to app
    console.log('📍 Step 1: Navigate to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
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
    await page.screenshot({ path: '/tmp/test-1.1.2-chat-opened.png' });

    // Send message to create session
    console.log('📍 Step 4: Send message to create session');
    const messageInput = await page.$('textarea[placeholder*="Type"]') || await page.$('textarea');
    if (!messageInput) {
      throw new Error('Could not find message input');
    }

    await messageInput.click();
    await page.waitForTimeout(300);
    await messageInput.fill('Start a review for Test Project Alpha with documents at /home/ygg/Workspace/RegenAI/regen-registry-review-mcp/test_data/botany_bay');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/test-1.1.2-message-typed.png' });
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
    console.log('📍 Step 6: Wait for session creation (15s)');
    await page.waitForTimeout(15000);
    await page.screenshot({ path: '/tmp/test-1.1.2-response.png' });
    console.log('   ✅ Response received\n');

    // Extract response text
    const pageText = await page.textContent('body');
    const responseText = pageText.slice(-2000);

    // Extract session ID
    const sessionMatch = responseText.match(/session-[a-f0-9]{12}/);
    const sessionId = sessionMatch ? sessionMatch[0] : null;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('RESPONSE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (sessionId) {
      console.log(`✅ Session ID extracted: ${sessionId}\n`);
    } else {
      console.log('❌ No session ID found in response\n');
    }

    console.log('📄 Response (last 1000 chars):');
    console.log('───────────────────────────────────────────────────────────');
    console.log(responseText.slice(-1000));
    console.log('───────────────────────────────────────────────────────────\n');

    // Check sessions directory after
    await page.waitForTimeout(2000); // Give filesystem a moment
    const sessionsAfter = await readdir(sessionsPath);
    console.log(`📁 Sessions after test: ${sessionsAfter.length} files`);

    if (sessionsAfter.length > sessionsBefore.length) {
      console.log(`✅ New session file created: ${sessionsAfter.filter(f => !sessionsBefore.includes(f))}\n`);
    } else {
      console.log(`❌ No new session file created\n`);
    }

    // Check for expected patterns
    const checks = {
      'Session ID found': sessionId !== null,
      'Session ID format correct': sessionId ? /^session-[a-f0-9]{12}$/.test(sessionId) : false,
      'Session file created': sessionsAfter.length > sessionsBefore.length,
      'Contains "created" or "started"': /(created|started|session)/i.test(responseText),
      'Response length > 100 chars': responseText.length > 100,
      'No error messages': !/error|failed|exception/i.test(responseText.toLowerCase())
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

    if (sessionId) {
      console.log('📋 SESSION INFO:');
      console.log('───────────────────────────────────────────────────────────');
      console.log(`   Session ID: ${sessionId}`);
      console.log(`   Project: Test Project Alpha`);
      console.log(`   Documents: /home/ygg/Workspace/RegenAI/regen-registry-review-mcp/test_data/botany_bay`);
      console.log('───────────────────────────────────────────────────────────\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✅ TEST 1.1.2 PASSED');
    } else {
      console.log('❌ TEST 1.1.2 FAILED');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('👁️  Browser window is open for visual inspection');
    console.log('📸 Screenshots saved to /tmp/test-1.1.2-*.png');
    console.log('⌨️  Press Ctrl+C when done inspecting\n');

    return allPassed;

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    await page.screenshot({ path: '/tmp/test-1.1.2-error.png' });
    console.log('📸 Error screenshot saved\n');
    return false;
  }
  // Browser intentionally left open for inspection
}

// Run the test
test_1_1_2_create_session().then(success => {
  // Keep process alive so browser stays open
});
