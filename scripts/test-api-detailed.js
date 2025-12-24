/**
 * Detailed API Key Test with OpenAI Debugging
 * Following: https://platform.openai.com/docs/api-reference/debugging-requests
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function detailedTest() {
  console.log('🔍 Detailed OpenAI API Key Test\n');
  console.log('================================\n');

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ No API key found in .env\n');
    process.exit(1);
  }

  console.log('📋 Key Info:');
  console.log('   Length:', apiKey.length);
  console.log('   Starts:', apiKey.substring(0, 15) + '...');
  console.log('   Ends:', '...' + apiKey.substring(apiKey.length - 10));
  console.log('   Format:', apiKey.startsWith('sk-proj-') ? '✅ New format' : '⚠️ Old format');
  console.log('');

  // Test 1: Simple API call
  console.log('📡 Test 1: List Models (minimal request)');
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: false,
  });

  try {
    const response = await openai.models.list();
    console.log('   ✅ Success! Found', response.data.length, 'models');
    console.log('   Sample models:', response.data.slice(0, 3).map(m => m.id).join(', '));
    console.log('');
  } catch (error) {
    console.log('   ❌ Failed');
    console.log('   Status:', error.status || 'Unknown');
    console.log('   Code:', error.code || 'Unknown');
    console.log('   Message:', error.message);
    console.log('   Type:', error.type || 'Unknown');

    if (error.status === 401) {
      console.log('');
      console.log('   🔍 401 Unauthorized - Possible causes:');
      console.log('   1. Invalid API key');
      console.log('   2. API key revoked');
      console.log('   3. Organization/Project mismatch');
      console.log('   4. API key lacks required permissions');
      console.log('');
    }

    if (error.response?.headers) {
      console.log('');
      console.log('   📋 Response Headers:');
      Object.entries(error.response.headers).forEach(([key, value]) => {
        if (key.toLowerCase().includes('openai') || key.toLowerCase().includes('auth')) {
          console.log('      ', key + ':', value);
        }
      });
    }

    console.log('');
    process.exit(1);
  }

  // Test 2: Check if DALL-E is available
  console.log('📡 Test 2: Check DALL-E 3 availability');
  try {
    const models = await openai.models.list();
    const dallE3 = models.data.find(m => m.id === 'dall-e-3');

    if (dallE3) {
      console.log('   ✅ DALL-E 3 is available');
      console.log('   Model ID:', dallE3.id);
      console.log('   Created:', new Date(dallE3.created * 1000).toISOString());
      console.log('');
    } else {
      console.log('   ⚠️  DALL-E 3 not found in available models');
      console.log('   Available image models:',
        models.data.filter(m => m.id.includes('dall')).map(m => m.id).join(', ') || 'None');
      console.log('');
      console.log('   💡 You may need to:');
      console.log('   1. Add credits to your account');
      console.log('   2. Upgrade your plan');
      console.log('   3. Enable image generation in settings');
      console.log('');
    }
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    console.log('');
  }

  // Test 3: Try a minimal chat completion (free quota)
  console.log('📡 Test 3: Minimal Chat Completion (gpt-3.5-turbo)');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });

    console.log('   ✅ Success!');
    console.log('   Response:', completion.choices[0].message.content);
    console.log('   Model used:', completion.model);
    console.log('   Usage:', completion.usage);
    console.log('');
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    if (error.status === 429) {
      console.log('   💡 Rate limited or insufficient credits');
    }
    console.log('');
  }

  // Final verdict
  console.log('================================');
  console.log('');
  console.log('✅ Your API key is working!');
  console.log('');
  console.log('💰 Check your credits:');
  console.log('   https://platform.openai.com/usage');
  console.log('');
  console.log('🎨 For image generation:');
  console.log('   npm run generate-images');
  console.log('');
}

detailedTest().catch(error => {
  console.error('\n❌ Unexpected error:', error.message);
  process.exit(1);
});
