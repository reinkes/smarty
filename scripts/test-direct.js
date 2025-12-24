/**
 * Direct API test - bypasses .env file
 * Tests if the OpenAI SDK works when key is passed directly
 */

import OpenAI from 'openai';
import fs from 'fs';

console.log('🔍 Direct API Test (bypassing .env)\n');
console.log('================================\n');

// Read key directly from .env file (bypass dotenv)
const envContent = fs.readFileSync('.env', 'utf-8');
const keyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);

if (!keyMatch) {
  console.error('❌ Could not find OPENAI_API_KEY in .env\n');
  process.exit(1);
}

const apiKey = keyMatch[1].trim();

console.log('📋 Key Info:');
console.log('   Read from: .env file (direct)');
console.log('   Length:', apiKey.length, 'characters');
console.log('   Starts:', apiKey.substring(0, 15) + '...');
console.log('   Ends:', '...' + apiKey.substring(apiKey.length - 10));
console.log('');

// Create OpenAI client with direct key
const openai = new OpenAI({
  apiKey: apiKey,
});

async function test() {
  try {
    console.log('📡 Testing API with direct key...');

    const response = await openai.models.list();

    console.log('✅ SUCCESS!\n');
    console.log('📊 Found', response.data.length, 'models');
    console.log('   Sample:', response.data.slice(0, 5).map(m => m.id).join(', '));
    console.log('');

    // Check for DALL-E
    const hasDallE3 = response.data.some(m => m.id === 'dall-e-3');
    const hasDallE2 = response.data.some(m => m.id === 'dall-e-2');

    if (hasDallE3) {
      console.log('🎨 DALL-E 3: ✅ Available');
    }
    if (hasDallE2) {
      console.log('🎨 DALL-E 2: ✅ Available');
    }

    if (!hasDallE3 && !hasDallE2) {
      console.log('⚠️  DALL-E not available - check billing');
    }

    console.log('');
    console.log('✅ Your API key works perfectly!');
    console.log('   Ready for image generation!');
    console.log('');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('   Status:', error.status);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

test();
