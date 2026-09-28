'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import en from './en.json';
import hi from './hi.json';
import bn from './bn.json';
import te from './te.json';
import ta from './ta.json';
import gu from './gu.json';

export type Language = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'gu';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const dictionaries: Record<Language, any> = {
  en,
  hi,
  bn,
  te,
  ta,
  gu,
};

// Build flat dictionary lookup: enText -> translatedText
function buildFlatLookup(sourceDict: any, targetDict: any): Map<string, string> {
  const map = new Map<string, string>();
  function recurse(src: any, tgt: any) {
    if (!src || typeof src !== 'object') return;
    for (const key of Object.keys(src)) {
      const srcVal = src[key];
      const tgtVal = tgt ? tgt[key] : undefined;
      if (typeof srcVal === 'string' && typeof tgtVal === 'string') {
        map.set(srcVal.trim().toLowerCase(), tgtVal);
      } else if (typeof srcVal === 'object') {
        recurse(srcVal, tgtVal);
      }
    }
  }
  recurse(sourceDict, targetDict);
  return map;
}

const flatLookups: Record<Language, Map<string, string>> = {
  en: new Map(),
  hi: buildFlatLookup(en, hi),
  bn: buildFlatLookup(en, bn),
  te: buildFlatLookup(en, te),
  ta: buildFlatLookup(en, ta),
  gu: buildFlatLookup(en, gu),
};

// Build dot-separated key-path dictionary lookup: "nav.dashboard" -> value
function buildKeyPathMap(dict: any, prefix = ''): Map<string, string> {
  const map = new Map<string, string>();
  function recurse(obj: any, currentPrefix: string) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      const path = currentPrefix ? `${currentPrefix}.${key}` : key;
      if (typeof value === 'string') {
        map.set(path, value);
      } else if (typeof value === 'object') {
        recurse(value, path);
      }
    }
  }
  recurse(dict, prefix);
  return map;
}

const keyPathMaps: Record<Language, Map<string, string>> = {
  en: buildKeyPathMap(en),
  hi: buildKeyPathMap(hi),
  bn: buildKeyPathMap(bn),
  te: buildKeyPathMap(te),
  ta: buildKeyPathMap(ta),
  gu: buildKeyPathMap(gu),
};

// Check if a string is or looks like a translation key (e.g. "nav.dashboard", "common.whatIfSimulator")
function isTranslationKey(text: string): boolean {
  const trimmed = text.trim();
  if (keyPathMaps.en.has(trimmed)) return true;
  return /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(trimmed);
}

// Fallback formatter for unmatched keys: "nav.howItWorks" -> "How It Works"
function formatKeyFallback(key: string): string {
  const lastPart = key.split('.').pop() || key;
  return lastPart
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Resolve any translation key path to its canonical English value
function resolveKeyToEnglish(keyOrText: string): string {
  const trimmed = keyOrText.trim();
  if (keyPathMaps.en.has(trimmed)) {
    return keyPathMaps.en.get(trimmed)!;
  }
  const lower = trimmed.toLowerCase();
  for (const [k, v] of keyPathMaps.en.entries()) {
    if (k.toLowerCase() === lower) {
      return v;
    }
  }
  if (isTranslationKey(trimmed)) {
    return formatKeyFallback(trimmed);
  }
  return keyOrText;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPathOrText: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (keyPathOrText: string) => resolveKeyToEnglish(keyPathOrText),
  isTranslating: false,
});

// Client in-memory translation cache across user navigation
const clientCache: Record<string, Map<string, string>> = {
  hi: new Map(),
  bn: new Map(),
  te: new Map(),
  ta: new Map(),
  gu: new Map(),
};

// Load persistent local storage cache on initialization
function getStoredCache(lang: string): Map<string, string> {
  if (typeof window === 'undefined') return clientCache[lang] || new Map();
  if (!clientCache[lang]) clientCache[lang] = new Map();
  try {
    const raw = localStorage.getItem(`unnate_cache_${lang}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        clientCache[lang].set(k, v as string);
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return clientCache[lang];
}

function saveStoredCache(lang: string) {
  if (typeof window === 'undefined') return;
  try {
    const langMap = clientCache[lang];
    if (!langMap) return;
    const obj: Record<string, string> = {};
    langMap.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(`unnate_cache_${lang}`, JSON.stringify(obj));
  } catch (e) {
    // Storage quota limit safe
  }
}

// Elements to ignore during DOM translation
const IGNORE_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'SVG',
  'PATH',
  'NOSCRIPT',
  'IFRAME',
]);

// Test if text is exclusively numerical, currency, symbol, or punctuation
function isNonTranslatable(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  // Pure digits, percentages, currencies, dates, punctuation, or single letters
  if (/^[\d\s₹$€%.,\-_:;!?+*&/()|[\]{}<>='"`~^#@\\]+$/.test(trimmed)) return true;
  // Specific invariant abbreviations
  if (/^(PMEGP|MUDRA|CGTMSE|PMFME|STANDUP_INDIA|MSME|NABARD|Udyam|FSSAI|DPR|EMI|GST|GSTIN|PAN|Aadhaar|OTP)$/i.test(trimmed)) return true;
  return false;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // WeakMap associates a DOM Text node with its canonical English source text
  const originalTextMap = useRef<WeakMap<Node, string>>(new WeakMap());
  const pendingNodes = useRef<Map<string, Node[]>>(new Map());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize language from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unnate_lang') as Language;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setLanguageState(saved);
      }
    } catch {
      // Default to en
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('unnate_lang', lang);
    } catch {
      // storage unavailable
    }
  };

  // Synchronous t() translation function
  const t = useCallback((keyPathOrText: string): string => {
    if (!keyPathOrText || typeof keyPathOrText !== 'string') return keyPathOrText;
    const trimmed = keyPathOrText.trim();

    // 1. Dotted translation key resolution (e.g. 'nav.howItWorks', 'common.whatIfSimulator')
    if (isTranslationKey(trimmed) || keyPathMaps.en.has(trimmed)) {
      // If language is English, resolve canonical English immediately
      if (language === 'en') {
        return resolveKeyToEnglish(trimmed);
      }

      // If language is non-English, check target language key dictionary
      if (keyPathMaps[language]?.has(trimmed)) {
        return keyPathMaps[language].get(trimmed)!;
      }

      // Fallback: resolve canonical English, then check phrase map/cache
      const canonicalEn = resolveKeyToEnglish(trimmed);
      const flatMap = flatLookups[language];
      if (flatMap && flatMap.has(canonicalEn.trim().toLowerCase())) {
        return flatMap.get(canonicalEn.trim().toLowerCase())!;
      }
      const cache = clientCache[language];
      if (cache && cache.has(canonicalEn.trim())) {
        return cache.get(canonicalEn.trim())!;
      }

      return canonicalEn;
    }

    // 2. Direct English phrase: if English, return directly
    if (language === 'en') return keyPathOrText;

    // 3. For target language != 'en', check static flat map by English phrase
    const flatMap = flatLookups[language];
    if (flatMap && flatMap.has(trimmed.toLowerCase())) {
      return flatMap.get(trimmed.toLowerCase())!;
    }

    // 4. Check dynamic client cache
    const cache = clientCache[language];
    if (cache && cache.has(trimmed)) {
      return cache.get(trimmed)!;
    }

    return keyPathOrText;
  }, [language]);

  // Batch translate queued texts via server-side /api/translate
  const processTranslationQueue = useCallback(async (targetLang: Language) => {
    if (targetLang === 'en') return;

    const queue = pendingNodes.current;
    if (queue.size === 0) return;

    const textsToFetch: string[] = [];
    const entries = Array.from(queue.entries());

    // Filter out already cached texts or translation keys
    const cache = getStoredCache(targetLang);
    const flatMap = flatLookups[targetLang];

    for (const [text, nodes] of entries) {
      // Guard: NEVER treat or send raw translation keys to translation API
      if (isTranslationKey(text) || keyPathMaps.en.has(text)) {
        const canonical = resolveKeyToEnglish(text);
        const translated =
          keyPathMaps[targetLang]?.get(text) ||
          flatMap?.get(canonical.trim().toLowerCase()) ||
          canonical;
        nodes.forEach((n) => {
          if (n.nodeValue !== translated) n.nodeValue = translated;
        });
        queue.delete(text);
        continue;
      }

      // Check static dictionary first
      const lower = text.trim().toLowerCase();
      if (flatMap && flatMap.has(lower)) {
        const translated = flatMap.get(lower)!;
        nodes.forEach((n) => {
          if (n.nodeValue !== translated) n.nodeValue = translated;
        });
        queue.delete(text);
        continue;
      }

      // Check client cache
      if (cache.has(text)) {
        const translated = cache.get(text)!;
        nodes.forEach((n) => {
          if (n.nodeValue !== translated) n.nodeValue = translated;
        });
        queue.delete(text);
        continue;
      }

      textsToFetch.push(text);
    }

    if (textsToFetch.length === 0) return;

    setIsTranslating(true);
    try {
      // Fetch in chunks of up to 35 strings
      const CHUNK_SIZE = 35;
      for (let i = 0; i < textsToFetch.length; i += CHUNK_SIZE) {
        const chunk = textsToFetch.slice(i, i + CHUNK_SIZE);
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: chunk, targetLang }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.translations)) {
            data.translations.forEach((translated: string, idx: number) => {
              const srcText = chunk[idx];
              if (translated && translated !== srcText) {
                cache.set(srcText, translated);
                const nodes = queue.get(srcText);
                if (nodes) {
                  nodes.forEach((n) => {
                    if (n.nodeValue !== translated) n.nodeValue = translated;
                  });
                }
              }
              queue.delete(srcText);
            });
          }
        }
      }
      saveStoredCache(targetLang);
    } catch (err) {
      console.warn('Translation batch update error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Scan and translate DOM text nodes
  const translateDOM = useCallback(() => {
    if (typeof window === 'undefined' || !document.body) return;

    // If English, ensure all keys are resolved to canonical English and restored
    if (language === 'en') {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let currentNode: Node | null = walker.nextNode();
      while (currentNode) {
        const val = currentNode.nodeValue || '';
        const trimmed = val.trim();

        // 1. If text node has a raw translation key, resolve it to canonical English immediately
        if (isTranslationKey(trimmed) || keyPathMaps.en.has(trimmed)) {
          const canonical = resolveKeyToEnglish(trimmed);
          const leadingWs = val.match(/^\s*/)?.[0] || '';
          const trailingWs = val.match(/\s*$/)?.[0] || '';
          const resolved = `${leadingWs}${canonical}${trailingWs}`;
          if (currentNode.nodeValue !== resolved) {
            currentNode.nodeValue = resolved;
          }
          originalTextMap.current.set(currentNode, canonical);
        }
        // 2. Otherwise restore original canonical English if previously translated
        else if (originalTextMap.current.has(currentNode)) {
          let original = originalTextMap.current.get(currentNode)!;
          // If recorded original was inadvertently a key, resolve it
          if (isTranslationKey(original.trim()) || keyPathMaps.en.has(original.trim())) {
            original = resolveKeyToEnglish(original.trim());
            originalTextMap.current.set(currentNode, original);
          }
          if (currentNode.nodeValue !== original) {
            currentNode.nodeValue = original;
          }
        }
        currentNode = walker.nextNode();
      }
      return;
    }

    // Target language != 'en': walk text nodes
    const cache = getStoredCache(language);
    const flatMap = flatLookups[language];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (IGNORE_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Node | null = walker.nextNode();
    while (node) {
      const currentVal = node.nodeValue || '';
      const currentTrimmed = currentVal.trim();
      const isKey = isTranslationKey(currentTrimmed) || keyPathMaps.en.has(currentTrimmed);

      // Record canonical English source text once
      if (!originalTextMap.current.has(node) || isKey) {
        if (isKey) {
          const canonical = resolveKeyToEnglish(currentTrimmed);
          originalTextMap.current.set(node, canonical);
        } else {
          originalTextMap.current.set(node, currentVal);
        }
      }

      let sourceEnglish = originalTextMap.current.get(node) || currentVal;
      // If recorded original was a translation key, resolve to canonical English
      if (isTranslationKey(sourceEnglish.trim()) || keyPathMaps.en.has(sourceEnglish.trim())) {
        sourceEnglish = resolveKeyToEnglish(sourceEnglish.trim());
        originalTextMap.current.set(node, sourceEnglish);
      }

      const trimmedEn = sourceEnglish.trim();
      const leadingWs = currentVal.match(/^\s*/)?.[0] || '';
      const trailingWs = currentVal.match(/\s*$/)?.[0] || '';

      if (!isNonTranslatable(trimmedEn)) {
        const lower = trimmedEn.toLowerCase();

        // 1. Direct key-path lookup in target dictionary
        if (isKey && keyPathMaps[language]?.has(currentTrimmed)) {
          const trans = keyPathMaps[language].get(currentTrimmed)!;
          if (node.nodeValue !== `${leadingWs}${trans}${trailingWs}`) {
            node.nodeValue = `${leadingWs}${trans}${trailingWs}`;
          }
        }
        // 2. Static dictionary phrase check using canonical English
        else if (flatMap && flatMap.has(lower)) {
          const trans = flatMap.get(lower)!;
          if (node.nodeValue !== `${leadingWs}${trans}${trailingWs}`) {
            node.nodeValue = `${leadingWs}${trans}${trailingWs}`;
          }
        }
        // 3. Client cache check using canonical English
        else if (cache.has(trimmedEn)) {
          const trans = cache.get(trimmedEn)!;
          if (node.nodeValue !== `${leadingWs}${trans}${trailingWs}`) {
            node.nodeValue = `${leadingWs}${trans}${trailingWs}`;
          }
        }
        // 4. Queue canonical English (NEVER the raw key!) for translation
        else {
          if (!pendingNodes.current.has(trimmedEn)) {
            pendingNodes.current.set(trimmedEn, []);
          }
          pendingNodes.current.get(trimmedEn)!.push(node);
        }
      }

      node = walker.nextNode();
    }

    // Trigger debounced batch translation
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      processTranslationQueue(language);
    }, 120);
  }, [language, processTranslationQueue]);

  // Execute translation on language change and listen to DOM mutations
  useEffect(() => {
    translateDOM();

    // Set up MutationObserver to translate dynamic page content
    const observer = new MutationObserver(() => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        translateDOM();
      }, language === 'en' ? 60 : 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [language, translateDOM]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
