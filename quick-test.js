#!/usr/bin/env node
/**
 * Quick Test Harness for Agent Iteration
 *
 * Usage: node quick-test.js
 *
 * Fast feedback loop:
 * 1. Edit character file
 * 2. Restart agent
 * 3. Run this script
 * 4. Get instant semantic validation
 */

const TEST_PROMPT = "Hi can you list all existing registry review projects?";

/**
 * Semantic validation - tests WHAT matters, not HOW it's formatted
 */
function validateSemantics(response, expectedSessionCount) {
  const results = {
    passed: true,
    checks: [],
    warnings: []
  };

  // Check 1: Response length proportional to data (not over-summarized)
  const minExpectedLength = expectedSessionCount * 100; // ~100 chars per session minimum
  const lengthOk = response.length >= minExpectedLength;
  results.checks.push({
    name: 'Proportional Length',
    passed: lengthOk,
    expected: `>= ${minExpectedLength} chars`,
    actual: `${response.length} chars`,
    reason: lengthOk ? 'Response has sufficient detail' : 'Response too short, likely summarized'
  });
  if (!lengthOk) results.passed = false;

  // Check 2: No over-helpfulness phrases
  const helpfulnessPatterns = [
    /would you like me to/i,
    /shall i help you/i,
    /do you want me to/i,
    /can i assist/i
  ];
  const helpfulnessFound = helpfulnessPatterns.filter(p => p.test(response));
  results.checks.push({
    name: 'No Excessive Helpfulness',
    passed: helpfulnessFound.length === 0,
    expected: '0 helpfulness phrases',
    actual: `${helpfulnessFound.length} found: ${helpfulnessFound.join(', ')}`,
    reason: helpfulnessFound.length === 0 ? 'Good CRUD response' : 'Too conversational for CRUD'
  });
  if (helpfulnessFound.length > 0) results.passed = false;

  // Check 3: No summary prose lead-ins
  const summaryPatterns = [
    /^(great news|i found|i see|here's what|let me show)/i,
    /^the (system has|database contains)/i
  ];
  const summaryFound = summaryPatterns.filter(p => p.test(response.trim()));
  results.checks.push({
    name: 'No Summary Lead-ins',
    passed: summaryFound.length === 0,
    expected: 'Direct data display',
    actual: summaryFound.length > 0 ? 'Summary prose detected' : 'Clean start',
    reason: summaryFound.length === 0 ? 'Direct display' : 'Agent is summarizing'
  });
  if (summaryFound.length > 0) results.passed = false;

  // Check 4: Has key field terms (semantic presence)
  const keyTerms = ['session', 'project', 'status', 'methodology'];
  const missingTerms = keyTerms.filter(term =>
    !response.toLowerCase().includes(term)
  );
  results.checks.push({
    name: 'Key Fields Present',
    passed: missingTerms.length === 0,
    expected: `All terms: ${keyTerms.join(', ')}`,
    actual: missingTerms.length > 0
      ? `Missing: ${missingTerms.join(', ')}`
      : 'All present',
    reason: missingTerms.length === 0 ? 'Complete data' : 'Missing key information'
  });
  if (missingTerms.length > 0) results.passed = false;

  // Warnings (don't fail test, but flag for review)
  if (response.match(/appears to be/i)) {
    results.warnings.push('Agent is interpreting data ("appears to be")');
  }
  if (response.match(/most (progressed|advanced|recent)/i)) {
    results.warnings.push('Agent is analyzing/ranking data');
  }

  return results;
}

/**
 * Pretty print results
 */
function printResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('  SEMANTIC VALIDATION RESULTS');
  console.log('='.repeat(60) + '\n');

  console.log(`Overall: ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('Checks:');
  results.checks.forEach((check, i) => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`\n${i + 1}. ${icon} ${check.name}`);
    console.log(`   Expected: ${check.expected}`);
    console.log(`   Actual:   ${check.actual}`);
    console.log(`   Reason:   ${check.reason}`);
  });

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(w => console.log(`   - ${w}`));
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main test runner
 */
async function runTest() {
  console.log('🚀 Quick Test Harness - Agent Iteration');
  console.log(`📝 Test Prompt: "${TEST_PROMPT}"\n`);

  // For now, this is a template for manual integration
  console.log('⚠️  TODO: Integrate with agent runtime');
  console.log('    Options:');
  console.log('    1. HTTP API call to agent');
  console.log('    2. Read from agent output file');
  console.log('    3. Playwright automation (already working)\n');

  // Example usage with mock data
  const mockResponse = `Here are all registry review sessions:

Registry Review Sessions (4 sessions)

Session: session-bf2e04fcf500
  Project: Botany Farm 2022-2023
  Status: initialized
  Methodology: soil-carbon-v1.2.2
  Documents: 7 found
  Stage: document_discovery (completed)

Session: session-3cedf16418c7
  Project: Botany Farm 2022-2023
  Status: initialized
  Methodology: soil-carbon-v1.2.2
  Stage: initialize (completed)

Session: session-7ae3f8b3b647
  Project: Botany Farm 2022-2023
  Status: initialized
  Stage: initialize (completed)

Session: session-aa0a6db384ee
  Project: Test Farm Minimal
  Status: initialized
  Stage: initialize (completed)`;

  const results = validateSemantics(mockResponse, 4);
  printResults(results);

  console.log('💡 Integration Instructions:');
  console.log('   1. Capture actual agent response');
  console.log('   2. Pass to validateSemantics(response, sessionCount)');
  console.log('   3. Get instant feedback on semantic quality\n');

  return results.passed ? 0 : 1;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(code => process.exit(code));
}

export { validateSemantics, printResults };
