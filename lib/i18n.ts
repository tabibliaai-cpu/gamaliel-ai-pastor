// i18n.ts - Language detection and translation utilities
// Uses the LLM API for translation to support all Indian and world languages

const LLM_API_BASE_URL = process.env.LLM_API_BASE_URL || 'https://api.openai.com/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME || 'gpt-3.5-turbo';

async function callLLMSimple(prompt: string): Promise<string> {
  const response = await fetch(`${LLM_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function detectLanguage(text: string): Promise<string> {
  if (!LLM_API_KEY || LLM_API_KEY === 'sk-your-api-key-here') return 'en';
  try {
    const result = await callLLMSimple(
      `Detect the language of this text and respond with ONLY the ISO 639-1 language code (e.g. en, hi, te, ta, kn, ml, mr, gu, pa, bn, or, as, ur, zh, ar, fr, de, es, pt, ru). Text: "${text.slice(0, 200)}"`
    );
    return result.slice(0, 5).toLowerCase().trim() || 'en';
  } catch {
    return 'en';
  }
}

export async function translateToEnglish(text: string, fromLang: string): Promise<string> {
  if (!LLM_API_KEY || LLM_API_KEY === 'sk-your-api-key-here' || fromLang === 'en') return text;
  try {
    const result = await callLLMSimple(
      `Translate the following text from ${fromLang} to English. Respond with ONLY the translation, nothing else. Text: "${text}"`
    );
    return result || text;
  } catch {
    return text;
  }
}

export async function translateFromEnglish(text: string, toLang: string): Promise<string> {
  if (!LLM_API_KEY || LLM_API_KEY === 'sk-your-api-key-here' || toLang === 'en') return text;
  try {
    const result = await callLLMSimple(
      `Translate the following text from English to ${toLang}. Respond with ONLY the translation, nothing else. Text: "${text}"`
    );
    return result || text;
  } catch {
    return text;
  }
}
