/**
 * AI Image Generation Script for German Word Database
 *
 * This script generates child-friendly images for all words in the German database
 * using OpenAI's DALL-E 3 API.
 *
 * Usage:
 *   node scripts/generate-images.js
 *
 * Prerequisites:
 *   npm install openai dotenv
 *   Create .env file with: OPENAI_API_KEY=sk-...
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load API key directly from .env file (bypass dotenv issues)
function loadApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return null;
  }
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/OPENAI_API_KEY=(.+)/);
  return match ? match[1].trim() : null;
}

// Configuration
const CONFIG = {
  dataFile: path.join(__dirname, '..', 'data', 'deutsch-words.json'),
  imageDir: path.join(__dirname, '..', 'images', 'generated'),
  apiKey: loadApiKey(),
  model: 'dall-e-3',
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid', // 'vivid' for more vibrant, icon-like colors
  delayBetweenRequests: 12000, // 12 seconds (DALL-E rate limit: 5/min)
  batchSize: 10, // Test: Only first 10 words (change to 100 for full generation)
  skipExisting: false, // Set to false to regenerate with new prompts
};

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: CONFIG.apiKey });

/**
 * Generate prompt for AI image generation
 */
function generatePrompt(word, category) {
  // Icon-style prompt for children
  const objectPrompt = `A single ${word}, centered. `;
  const stylePrompt = `Flat icon style, simple shapes, bold outlines, bright solid colors. `;
  const structurePrompt = `Clear, recognizable silhouette. Like an emoji or app icon. `;
  const detailPrompt = `Minimal details, cartoon style, friendly appearance. `;
  const backgroundPrompt = `Plain white background, no shadows, no text. `;
  const targetPrompt = `Perfect for children aged 6-8 to instantly recognize. `;
  const constraint = `Only ONE ${word}, not multiple. Front view, full object visible.`;

  return objectPrompt + stylePrompt + structurePrompt + detailPrompt + backgroundPrompt + targetPrompt + constraint;
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

/**
 * Generate image for a single word
 */
async function generateImageForWord(word, category) {
  const filename = `${word.toLowerCase().replace(/[äöüß]/g, c => {
    const map = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
    return map[c] || c;
  })}.png`;

  const filepath = path.join(CONFIG.imageDir, filename);

  // Skip if image already exists and skipExisting is true
  if (CONFIG.skipExisting && fs.existsSync(filepath)) {
    console.log(`  ⏭️  Skipping "${word}" - image already exists`);
    return `images/generated/${filename}`;
  }

  const prompt = generatePrompt(word, category);

  console.log(`  🎨 Generating image for "${word}"...`);
  console.log(`     Prompt: ${prompt.substring(0, 80)}...`);

  try {
    const response = await openai.images.generate({
      model: CONFIG.model,
      prompt: prompt,
      n: 1,
      size: CONFIG.size,
      quality: CONFIG.quality,
      style: CONFIG.style,
    });

    const imageUrl = response.data[0].url;

    // Download and save image
    await downloadImage(imageUrl, filepath);

    console.log(`  ✅ Saved: ${filename}`);

    // Return relative path for JSON
    return `images/generated/${filename}`;
  } catch (error) {
    console.error(`  ❌ Error generating image for "${word}":`, error.message);
    return null; // Keep emoji as fallback
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 AI Image Generation for German Word Database');
  console.log('================================================\n');

  // Validate API key
  if (!CONFIG.apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY not found in environment variables');
    console.error('   Please run: node scripts/setup-env.js');
    process.exit(1);
  }

  // Show key info
  console.log('🔑 API Key found');
  console.log(`   Starts with: ${CONFIG.apiKey.substring(0, 15)}...`);
  console.log(`   Length: ${CONFIG.apiKey.length} characters\n`);

  // Ensure image directory exists
  if (!fs.existsSync(CONFIG.imageDir)) {
    fs.mkdirSync(CONFIG.imageDir, { recursive: true });
    console.log(`📁 Created directory: ${CONFIG.imageDir}\n`);
  }

  // Load word database
  console.log('📖 Loading word database...');
  const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf-8'));
  const words = data.words;

  console.log(`   Found ${words.length} words in database\n`);

  // Cost calculation
  const wordsToGenerate = words.filter(w =>
    !w.image || w.image === null ||
    (CONFIG.skipExisting && !fs.existsSync(path.join(CONFIG.imageDir, `${w.word.toLowerCase()}.png`)))
  );

  const estimatedCost = wordsToGenerate.length * 0.04;
  const estimatedTime = Math.ceil(wordsToGenerate.length * CONFIG.delayBetweenRequests / 60000);

  console.log('💰 Cost Estimate:');
  console.log(`   Images to generate: ${wordsToGenerate.length}`);
  console.log(`   Cost: ~$${estimatedCost.toFixed(2)} (DALL-E 3 standard)`);
  console.log(`   Time: ~${estimatedTime} minutes\n`);

  if (wordsToGenerate.length === 0) {
    console.log('✅ All images already generated!');
    console.log('   Run with skipExisting: false to regenerate.\n');
    return;
  }

  // Confirmation
  console.log('⚠️  This will charge your OpenAI account!\n');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Process words in batches
  const wordsToProcess = words.slice(0, CONFIG.batchSize);
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log(`🎯 Processing ${wordsToProcess.length} words...\n`);

  for (let i = 0; i < wordsToProcess.length; i++) {
    const word = wordsToProcess[i];
    console.log(`[${i + 1}/${wordsToProcess.length}] ${word.word} (${word.difficulty}, ${word.category || 'N/A'})`);

    const imagePath = await generateImageForWord(word.word, word.category || 'object');

    if (imagePath) {
      word.image = imagePath;

      if (imagePath && !CONFIG.skipExisting) {
        successCount++;
      } else {
        skippedCount++;
      }
    } else {
      errorCount++;
    }

    // Rate limiting: wait before next request
    if (i < wordsToProcess.length - 1) {
      const delay = CONFIG.delayBetweenRequests;
      console.log(`  ⏳ Waiting ${delay / 1000}s before next request...\n`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Update JSON file with image paths
  console.log('\n💾 Updating word database with image paths...');
  data.lastUpdated = new Date().toISOString().split('T')[0];
  data.version = incrementVersion(data.version);

  fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log('   ✅ Database updated\n');

  // Summary
  console.log('📊 Summary');
  console.log('==========');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Images saved to: ${CONFIG.imageDir}`);
  console.log(`💾 Database updated: ${CONFIG.dataFile}`);

  // Cost calculation
  const totalGenerated = successCount;
  const costPerImage = 0.040; // DALL-E 3 standard 1024x1024
  const actualCost = totalGenerated * costPerImage;

  console.log(`\n💰 Actual Cost: $${actualCost.toFixed(2)} (${totalGenerated} images × $${costPerImage})`);

  console.log('\n✨ Done!');
}

/**
 * Increment semantic version
 */
function incrementVersion(version) {
  const parts = version.split('.');
  parts[parts.length - 1] = (parseInt(parts[parts.length - 1]) + 1).toString();
  return parts.join('.');
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
