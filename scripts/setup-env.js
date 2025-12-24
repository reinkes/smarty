/**
 * Setup .env file with API key validation
 * Prevents duplicate/corrupted keys
 */

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Setup OpenAI API Key\n');
console.log('This will create/update your .env file with validation.\n');

rl.question('Paste your OpenAI API key: ', (key) => {
  // Clean the key
  const cleanKey = key.trim();

  console.log('\n🔍 Validating key...\n');

  // Validate format
  if (!cleanKey.startsWith('sk-')) {
    console.error('❌ Invalid key format - must start with "sk-"');
    console.error('   Your key starts with:', cleanKey.substring(0, 10));
    process.exit(1);
  }

  // Check length
  if (cleanKey.length < 40) {
    console.error('❌ Key too short:', cleanKey.length, 'characters');
    console.error('   Should be 100+ characters');
    console.error('   You may have copied only part of the key!');
    process.exit(1);
  }

  // Check for duplicate sections (common copy-paste error)
  const halfLength = Math.floor(cleanKey.length / 2);
  const firstHalf = cleanKey.substring(0, halfLength);
  const secondHalf = cleanKey.substring(halfLength);

  // Look for repeating 20+ character sequences
  for (let i = 0; i < firstHalf.length - 20; i++) {
    const chunk = firstHalf.substring(i, i + 20);
    if (secondHalf.includes(chunk)) {
      console.error('❌ Duplicate section detected in key!');
      console.error('   The sequence "' + chunk + '" appears multiple times');
      console.error('   This usually means the key was copied incorrectly');
      console.error('');
      console.error('   Please:');
      console.error('   1. Go to https://platform.openai.com/api-keys');
      console.error('   2. Click the 📋 copy button (don\'t manually select!)');
      console.error('   3. Run this script again');
      process.exit(1);
    }
  }

  // Check for spaces or newlines
  if (/\s/.test(cleanKey)) {
    console.error('❌ Key contains whitespace!');
    console.error('   This will cause authentication to fail');
    process.exit(1);
  }

  // All validations passed
  console.log('✅ Key format: Valid');
  console.log('✅ Length:', cleanKey.length, 'characters');
  console.log('✅ No duplicates detected');
  console.log('✅ No whitespace');
  console.log('');

  // Write to .env
  const envContent = `OPENAI_API_KEY=${cleanKey}`;

  try {
    fs.writeFileSync('.env', envContent, { encoding: 'utf-8', flag: 'w' });
    console.log('✅ Saved to .env file\n');

    // Verify by reading back
    const saved = fs.readFileSync('.env', 'utf-8');
    const savedKey = saved.split('=')[1];

    if (savedKey === cleanKey) {
      console.log('✅ Verified: .env file is correct\n');
      console.log('🎯 Next steps:');
      console.log('   1. Test: npm run test-api-detailed');
      console.log('   2. Generate: npm run generate-images');
      console.log('');
    } else {
      console.error('⚠️  Warning: Saved key differs from input');
      console.error('   This might be an encoding issue');
    }

  } catch (error) {
    console.error('❌ Failed to write .env:', error.message);
    process.exit(1);
  }

  rl.close();
});
