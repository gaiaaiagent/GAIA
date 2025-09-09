#!/usr/bin/env node

// Test if dotenv can load CHARACTER.* variables from .env file
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Check what CHARACTER variables were loaded
console.log('\nCHARACTER variables loaded by dotenv:');
console.log('=====================================');

const characterVars = Object.entries(process.env)
  .filter(([key]) => key.startsWith('CHARACTER.'))
  .sort();

if (characterVars.length === 0) {
  console.log('❌ No CHARACTER.* variables found in process.env');
} else {
  characterVars.forEach(([key, value]) => {
    // Mask tokens for security
    const displayValue = key.includes('TOKEN') 
      ? value.substring(0, 10) + '...' 
      : value;
    console.log(`✅ ${key} = ${displayValue}`);
  });
}

// Test specific variable access
console.log('\nTest specific access:');
console.log('====================');
const testToken = process.env['CHARACTER.TESTREGEN.TELEGRAM_BOT_TOKEN'];
if (testToken) {
  console.log('✅ CHARACTER.TESTREGEN.TELEGRAM_BOT_TOKEN is accessible:', testToken.substring(0, 10) + '...');
} else {
  console.log('❌ CHARACTER.TESTREGEN.TELEGRAM_BOT_TOKEN not found');
}

// Show how ElizaOS would process it
const characterName = 'TestRegen';
const characterId = characterName.toUpperCase().replace(/ /g, '_');
const characterPrefix = `CHARACTER.${characterId}.`;
console.log('\nElizaOS would look for prefix:', characterPrefix);

const characterSettings = Object.entries(process.env)
  .filter(([key]) => key.startsWith(characterPrefix))
  .reduce((settings, [key, value]) => {
    const settingKey = key.slice(characterPrefix.length);
    return { ...settings, [settingKey]: value };
  }, {});

console.log('Settings extracted:', characterSettings);