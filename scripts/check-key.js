import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.XAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey.trim() === '' || apiKey === 'xai-...') {
  console.warn('\n======================================================================');
  console.warn('⚠️  NOTICE: XAI_API_KEY is not configured.');
  console.warn('If you wish to use grok-4.5, generate an API key at https://console.x.ai');
  console.warn('and export XAI_API_KEY="xai-...".');
  if (geminiKey) {
    console.log('✅ GEMINI_API_KEY is configured for Gemini AI intelligence features.');
  }
  console.warn('======================================================================\n');
} else {
  console.log('✅ Pre-flight check passed: XAI_API_KEY is configured.');
}

