# Image Generation Scripts

## Overview

These scripts generate AI-powered images for the German word database using OpenAI's DALL-E 3 API.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# OPENAI_API_KEY=sk-...your-actual-key...
```

## Usage

### Generate All Images

Generate images for all 83 words in the database:

```bash
npm run generate-images
```

This will:
- Read all words from `data/deutsch-words.json`
- Generate child-friendly illustrations for each word
- Save images to `images/generated/`
- Update the JSON file with image paths
- Show progress and cost estimation

### Configuration

Edit `scripts/generate-images.js` to customize:

```javascript
const CONFIG = {
  model: 'dall-e-3',           // AI model
  size: '1024x1024',            // Image size
  quality: 'standard',          // 'standard' or 'hd'
  style: 'natural',             // 'natural' or 'vivid'
  delayBetweenRequests: 12000,  // Rate limiting (12s = 5 per minute)
  skipExisting: true,           // Skip if image already exists
};
```

## Cost Estimation

**DALL-E 3 Pricing (as of Dec 2024):**
- Standard 1024x1024: $0.040 per image
- HD 1024x1024: $0.080 per image

**Total Cost for 83 Words:**
- Standard quality: **$3.32**
- HD quality: **$6.64**

## Rate Limits

OpenAI DALL-E 3:
- **5 images per minute** (free tier)
- **50 images per minute** (paid tier)

The script automatically waits 12 seconds between requests to respect the 5/min limit.

## Output

Generated images are saved to:
```
images/generated/
├── katze.png
├── hund.png
├── baum.png
└── ...
```

The JSON database is automatically updated:
```json
{
  "word": "Katze",
  "syllable": "Ka",
  "emoji": "🐱",
  "image": "images/generated/katze.png",  ← Added
  "difficulty": "easy",
  "category": "Tiere"
}
```

## Troubleshooting

### "OPENAI_API_KEY not found"
Make sure you created a `.env` file with your API key:
```bash
echo "OPENAI_API_KEY=sk-your-key" > .env
```

### "Rate limit exceeded"
Increase `delayBetweenRequests` in the config:
```javascript
delayBetweenRequests: 15000,  // 15 seconds instead of 12
```

### "Insufficient credits"
Add credits to your OpenAI account:
https://platform.openai.com/account/billing

### Images look wrong
Try different prompts or styles:
```javascript
style: 'vivid',  // More artistic/creative
quality: 'hd',   // Higher quality
```

## Alternative: Cheaper Image Generation

If DALL-E is too expensive, consider:

**Stable Diffusion (Stability AI):**
- Cost: $0.002-0.01 per image (cheaper!)
- Total for 83 images: ~$0.83
- API: https://platform.stability.ai/

**Free Alternatives:**
- Use stock photo libraries (Unsplash, Pexels)
- Use icon libraries (Flaticon, Noun Project)
- Hire an illustrator on Fiverr (~$50 for 100 images)

## Deployment Strategy

### Option 1: Commit Images to Git
```bash
# Generate images
npm run generate-images

# Commit them
git add images/generated/
git commit -m "Add AI-generated word images"
git push

# They'll be deployed with the app
```

**Pros:** Fast loading, works offline
**Cons:** Large repository size

### Option 2: Deploy Separately
```bash
# Add to .gitignore
echo "images/generated/*.png" >> .gitignore

# Upload to CDN (Cloudflare, Vercel, etc.)
# Update JSON to use CDN URLs
```

**Pros:** Smaller repository
**Cons:** Requires CDN setup

## Next Steps

After generating images:

1. **Test in Beta:**
   ```bash
   # Push to beta environment
   git push origin master
   # Beta URL: https://your-domain.com/beta/
   ```

2. **Review Images:**
   - Check image quality
   - Verify they're child-friendly
   - Regenerate any that don't look good

3. **Deploy to Production:**
   ```bash
   # Create version tag
   git tag v2.1.0
   git push origin v2.1.0
   # Production deployment triggered automatically
   ```

4. **Monitor Costs:**
   - Check OpenAI usage: https://platform.openai.com/usage
   - Set up billing alerts if needed

## Support

For issues or questions, check:
- OpenAI API Docs: https://platform.openai.com/docs
- DALL-E Guide: https://platform.openai.com/docs/guides/images
