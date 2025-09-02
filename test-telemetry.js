#!/usr/bin/env node

// Simple test script to validate telemetry system
import dotenv from 'dotenv';
import path from 'path';

// Load telemetry test environment
dotenv.config({ path: './test-telemetry.env' });

console.log('🔍 Testing Telemetry System...');
console.log('Environment variables:');
console.log('LOG_TELEMETRY:', process.env.LOG_TELEMETRY);
console.log('LOG_PROMPTS:', process.env.LOG_PROMPTS);
console.log('LOG_PROVIDERS:', process.env.LOG_PROVIDERS);

async function testTelemetry() {
  try {
    console.log('✅ Importing telemetry modules...');
    
    // Test core telemetry imports
    const { TelemetryManager, TelemetryConfig, createCorrelatedLogger } = await import('./packages/core/dist/index.js');
    
    console.log('✅ TelemetryConfig loaded:', {
      LOG_TELEMETRY: TelemetryConfig.LOG_TELEMETRY,
      LOG_PROMPTS: TelemetryConfig.LOG_PROMPTS,
      LOG_PROVIDERS: TelemetryConfig.LOG_PROVIDERS,
      LOG_TIMING_THRESHOLD: TelemetryConfig.LOG_TIMING_THRESHOLD
    });

    // Test basic telemetry operations
    const { createLogger } = await import('./packages/core/dist/index.js');
    const logger = createLogger();
    
    const telemetry = TelemetryManager.getInstance(logger);
    
    console.log('✅ Creating test telemetry span...');
    const testSpan = telemetry.startSpan('test-operation', undefined, {
      testProperty: 'test-value'
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    telemetry.endSpan(testSpan);
    
    console.log('✅ Test span completed successfully');
    
    // Test telemetry statistics
    const stats = telemetry.getStatistics();
    console.log('✅ Telemetry statistics:', stats);
    
    console.log('🎉 Telemetry system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Telemetry test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testTelemetry();