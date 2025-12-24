/**
 * Debug .env file loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Debug Environment Variables\n');
console.log('================================\n');

// 1. Check current directory
console.log('📁 Directories:');
console.log('   Current dir:', process.cwd());
console.log('   Project root:', projectRoot);
console.log('   Script dir:', __dirname);
console.log('');

// 2. Check if .env file exists
const envPath = path.join(projectRoot, '.env');
console.log('📄 .env File:');
console.log('   Expected path:', envPath);
console.log('   Exists:', fs.existsSync(envPath) ? '✅ YES' : '❌ NO');

if (fs.existsSync(envPath)) {
  const stats = fs.statSync(envPath);
  console.log('   Size:', stats.size, 'bytes');
  console.log('   Modified:', stats.mtime.toISOString());

  // Read raw content
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log('   Lines:', content.split('\n').length);
  console.log('   First 50 chars:', content.substring(0, 50).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
} else {
  console.log('   ❌ File not found!');
  console.log('');
  console.log('   Please create it:');
  console.log('   echo "OPENAI_API_KEY=sk-proj-..." > .env');
}

console.log('');

// 3. Try to load with dotenv
console.log('🔧 Loading with dotenv:');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('   ❌ Error:', result.error.message);
} else {
  console.log('   ✅ Loaded successfully');
  console.log('   Parsed keys:', Object.keys(result.parsed || {}));
}

console.log('');

// 4. Check environment variable
console.log('🔑 API Key Status:');
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('   ❌ NOT FOUND in process.env');
  console.log('');
  console.log('   Possible issues:');
  console.log('   1. .env file missing');
  console.log('   2. Wrong format in .env');
  console.log('   3. Encoding issues (BOM)');
  console.log('   4. Variable name typo');
} else {
  console.log('   ✅ FOUND in process.env');
  console.log('   Starts with:', apiKey.substring(0, 10) + '...');
  console.log('   Length:', apiKey.length, 'characters');
  console.log('   Format check:', apiKey.startsWith('sk-') ? '✅ Valid format' : '❌ Invalid format');

  // Check for common issues
  if (apiKey.includes(' ')) {
    console.log('   ⚠️  WARNING: Contains spaces!');
  }
  if (apiKey.includes('\n') || apiKey.includes('\r')) {
    console.log('   ⚠️  WARNING: Contains newlines!');
  }
  if (apiKey !== apiKey.trim()) {
    console.log('   ⚠️  WARNING: Has leading/trailing whitespace!');
  }
}

console.log('');

// 5. All environment variables (filtered)
console.log('🌍 All Environment Variables:');
const envVars = Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API'));
if (envVars.length > 0) {
  envVars.forEach(k => {
    const val = process.env[k];
    console.log(`   ${k}:`, val ? val.substring(0, 15) + '...' : '(empty)');
  });
} else {
  console.log('   No OpenAI/API related variables found');
}

console.log('');
console.log('================================');
console.log('');

// Provide fix suggestions
if (!apiKey) {
  console.log('💡 How to fix:');
  console.log('');
  console.log('   1. Create .env file in project root:');
  console.log('      cd', projectRoot);
  console.log('      echo "OPENAI_API_KEY=sk-proj-your-key" > .env');
  console.log('');
  console.log('   2. Or use PowerShell:');
  console.log('      @"');
  console.log('      OPENAI_API_KEY=sk-proj-your-key');
  console.log('      "@ | Out-File -FilePath .env -Encoding UTF8');
  console.log('');
  console.log('   3. Then test again:');
  console.log('      npm run test-api');
}
