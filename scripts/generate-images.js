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
  batchSize: 100, // Generate all images
  skipExisting: false, // Regenerate all with new ultra-strict prompts
};

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: CONFIG.apiKey });

/**
 * Translate German word to English for DALL-E prompt
 */
function translateToEnglish(germanWord) {
  const translations = {
    'Katze': 'cat', 'Hund': 'dog', 'Baum': 'tree', 'Haus': 'house', 'Auto': 'car',
    'Ball': 'ball', 'Sonne': 'sun', 'Mond': 'moon', 'Fisch': 'fish', 'Vogel': 'bird',
    'Tisch': 'table', 'Tasse': 'cup', 'Buch': 'book', 'Lampe': 'lamp', 'Mama': 'mother',
    'Papa': 'father', 'Baby': 'baby', 'Telefon': 'telephone', 'Apfel': 'apple', 'Banane': 'banana',
    'Elefant': 'elephant', 'Tiger': 'tiger', 'Löwe': 'lion', 'Panda': 'panda', 'Affe': 'monkey',
    'Giraffe': 'giraffe', 'Pizza': 'pizza', 'Kuchen': 'cake', 'Eis': 'ice cream', 'Keks': 'cookie',
    'Schule': 'school', 'Blume': 'flower', 'Stern': 'star', 'Pferd': 'horse', 'Frosch': 'frog',
    'Schmetterling': 'butterfly', 'Strand': 'beach', 'Traktor': 'tractor', 'Flugzeug': 'airplane',
    'Schiff': 'ship', 'Brot': 'bread', 'Schokolade': 'chocolate', 'Glas': 'glass', 'Stuhl': 'chair',
    'Fahrrad': 'bicycle', 'Roller': 'scooter', 'Zug': 'train', 'Bus': 'bus', 'Rakete': 'rocket',
    'Igel': 'hedgehog', 'Hase': 'rabbit', 'Eule': 'owl', 'Fuchs': 'fox', 'Bär': 'bear',
    'Pinguin': 'penguin', 'Delfin': 'dolphin', 'Eichhörnchen': 'squirrel', 'Schlange': 'snake',
    'Schildkröte': 'turtle', 'Käfer': 'beetle', 'Schnecke': 'snail', 'Wolke': 'cloud',
    'Regenbogen': 'rainbow', 'Berg': 'mountain', 'Kirsche': 'cherry', 'Erdbeere': 'strawberry',
    'Orange': 'orange', 'Tomate': 'tomato', 'Karotte': 'carrot'
  };

  return translations[germanWord] || germanWord.toLowerCase();
}

/**
 * Generate prompt for AI image generation
 */
function generatePrompt(word, category) {
  // Translate German word to English for consistent prompt
  const englishWord = translateToEnglish(word);

  // RADICAL SIMPLICITY - less is more
  return `A single ${englishWord} icon. Flat simple cartoon style like an emoji. White background. Nothing else.`;
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

  // Determine which words to process
  let wordsToProcess;
  if (CONFIG.skipExisting) {
    // Skip words that already have generated images
    wordsToProcess = words.filter(w => {
      const filename = `${w.word.toLowerCase().replace(/[äöüß]/g, c => {
        const map = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
        return map[c] || c;
      })}.png`;
      const filepath = path.join(CONFIG.imageDir, filename);
      return !fs.existsSync(filepath);
    });
  } else {
    // Regenerate all words (up to batchSize)
    wordsToProcess = words;
  }

  // Limit to batchSize
  wordsToProcess = wordsToProcess.slice(0, CONFIG.batchSize);

  const estimatedCost = wordsToProcess.length * 0.04;
  const estimatedTime = Math.ceil(wordsToProcess.length * CONFIG.delayBetweenRequests / 60000);

  console.log('💰 Cost Estimate:');
  console.log(`   Images to generate: ${wordsToProcess.length}`);
  console.log(`   Cost: ~$${estimatedCost.toFixed(2)} (DALL-E 3 standard)`);
  console.log(`   Time: ~${estimatedTime} minutes\n`);

  if (wordsToProcess.length === 0) {
    console.log('✅ All images already generated!');
    console.log('   Set skipExisting: false to regenerate.\n');
    return;
  }

  // Confirmation
  console.log('⚠️  This will charge your OpenAI account!\n');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Process words
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
