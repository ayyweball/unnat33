import { NextResponse } from 'next/server';

// Server-side cache for translated strings: targetLang -> (sourceText -> translatedText)
const translationCache: Record<string, Map<string, string>> = {
  hi: new Map(),
  bn: new Map(),
  te: new Map(),
  ta: new Map(),
  gu: new Map(),
};

// Patterns to protect from translation (proper nouns, currencies, IDs, codes, numbers)
const PROTECT_PATTERNS = [
  /₹\s?[\d,]+(\.\d+)?(\s?(Cr|Lakh|k|M|B))?/gi,
  /[\d,]+(\.\d+)?%/g,
  /\b(PMEGP|MUDRA|CGTMSE|PMFME|STANDUP_INDIA|NBCFDC|NSFDC|NSKFDC|PM-SVANIDHI|MSME|NABARD|Udyam|FSSAI|DIC|SCA|DPR|EMI)\b/g,
  /\b\d+([–\-]\d+)?\b/g,
];

function protectText(text: string): { protectedText: string; tokens: string[] } {
  let counter = 0;
  const tokens: string[] = [];

  let protectedText = text;
  for (const pattern of PROTECT_PATTERNS) {
    protectedText = protectedText.replace(pattern, (match) => {
      const placeholder = `__P${counter}__`;
      tokens.push(match);
      counter++;
      return placeholder;
    });
  }

  return { protectedText, tokens };
}

function restoreText(translated: string, tokens: string[]): string {
  let result = translated;
  tokens.forEach((token, index) => {
    // Regex handles potential spacing variations introduced by translation
    const regex = new RegExp(`__\\s*P\\s*${index}\\s*__`, 'g');
    result = result.replace(regex, token);
  });
  return result;
}

async function translateSingleString(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '' || targetLang === 'en') {
    return text;
  }

  const langCache = translationCache[targetLang] || (translationCache[targetLang] = new Map());
  if (langCache.has(text)) {
    return langCache.get(text)!;
  }

  // Check if string is only numbers, symbols, whitespace
  if (/^[\d\s₹%.,\-_:;!?+*&/()|[\]{}<>='"]+$/.test(text)) {
    return text;
  }

  try {
    const { protectedText, tokens } = protectText(text);

    // Call server-side translation service (never exposed to client)
    const encoded = encodeURIComponent(protectedText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const rawTranslated = data[0].map((chunk: any) => chunk[0]).join('');
        const finalTranslation = restoreText(rawTranslated, tokens);
        langCache.set(text, finalTranslation);
        return finalTranslation;
      }
    }
  } catch (err) {
    console.warn(`Translation error for "${text.slice(0, 30)}..." to ${targetLang}:`, err);
  }

  // Fallback to original text if translation service unavailable
  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { texts, targetLang } = body;

    if (!Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 });
    }

    if (!targetLang || typeof targetLang !== 'string') {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    const validLangs = ['en', 'hi', 'bn', 'te', 'ta', 'gu'];
    if (!validLangs.includes(targetLang)) {
      return NextResponse.json({ error: `Unsupported target language: ${targetLang}` }, { status: 400 });
    }

    if (targetLang === 'en') {
      return NextResponse.json({ translations: texts });
    }

    // Translate all strings (leveraging cache & parallel translation with concurrency limit)
    const MAX_CONCURRENT = 10;
    const translations: string[] = new Array(texts.length);

    for (let i = 0; i < texts.length; i += MAX_CONCURRENT) {
      const chunk = texts.slice(i, i + MAX_CONCURRENT);
      const chunkResults = await Promise.all(
        chunk.map((t) => translateSingleString(typeof t === 'string' ? t : String(t), targetLang))
      );
      for (let j = 0; j < chunkResults.length; j++) {
        translations[i + j] = chunkResults[j];
      }
    }

    return NextResponse.json({ translations });
  } catch (err: any) {
    console.error('Translation route failure:', err);
    return NextResponse.json(
      { error: 'Internal translation processing error', details: err?.message },
      { status: 500 }
    );
  }
}
