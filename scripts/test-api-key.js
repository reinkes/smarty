/**
 * Test OpenAI API Key
 *
 * This script verifies your API key works without generating images.
 * No cost - just a simple API ping.
 *
 * Usage: node scripts/test-api-key.js
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testApiKey() {
  console.log('🔍 Testing OpenAI API Key...\n');

  // Check if key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY not found in .env file');
    console.error('   Please create .env file with your API key\n');
    process.exit(1);
  }

  const key = process.env.OPENAI_API_KEY;
  console.log('✅ API Key found in .env');
  console.log(`   Starts with: ${key.substring(0, 10)}...`);
  console.log(`   Length: ${key.length} characters\n`);

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: key });

  try {
    console.log('📡 Sending test request to OpenAI API...');

    // Use models.list() - it's free and just verifies the key
    const models = await openai.models.list();

    console.log('✅ SUCCESS! API Key is valid\n');
    console.log('📊 Available models:', models.data.slice(0, 3).map(m => m.id).join(', '), '...\n');

    // Check if DALL-E 3 is available
    const hasDallE = models.data.some(m => m.id === 'dall-e-3');
    if (hasDallE) {
      console.log('🎨 DALL-E 3 is available for image generation');
    } else {
      console.log('⚠️  DALL-E 3 not found in available models');
      console.log('   You may need to add credits to your account');
    }

    console.log('\n✅ Your API key is working correctly!');
    console.log('   You can now run: npm run generate-images\n');

  } catch (error) {
    console.error('\n❌ API Key Test FAILED\n');

    if (error.status === 401) {
      console.error('   Error: Invalid API key');
      console.error('   Please check your key at: https://platform.openai.com/api-keys\n');
    } else if (error.status === 429) {
      console.error('   Error: Rate limit exceeded or insufficient credits');
      console.error('   Check your usage: https://platform.openai.com/usage\n');
    } else {
      console.error('   Error:', error.message);
      console.error('   Status:', error.status || 'Unknown\n');
    }

    process.exit(1);
  }
}

testApiKey();
