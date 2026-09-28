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

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPathOrText: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (keyPathOrText: string) => keyPathOrText,
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
    if (language === 'en') return keyPathOrText;

    // 1. Check dotted dictionary key
    const dictionary = dictionaries[language] || en;
    const keys = keyPathOrText.split('.');
    let current: any = dictionary;
    let found = true;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }
    if (found && typeof current === 'string') {
      return current;
    }

    // 2. Check flat English phrase lookup in static dictionary
    const flatMap = flatLookups[language];
    if (flatMap && flatMap.has(keyPathOrText.trim().toLowerCase())) {
      return flatMap.get(keyPathOrText.trim().toLowerCase())!;
    }

    // 3. Check dynamic client cache
    const cache = clientCache[language];
    if (cache && cache.has(keyPathOrText.trim())) {
      return cache.get(keyPathOrText.trim())!;
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

    // Filter out already cached texts
    const cache = getStoredCache(targetLang);
    const flatMap = flatLookups[targetLang];

    for (const [text, nodes] of entries) {
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

    // If English, restore all canonical original texts
    if (language === 'en') {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let currentNode: Node | null = walker.nextNode();
      while (currentNode) {
        if (originalTextMap.current.has(currentNode)) {
          const original = originalTextMap.current.get(currentNode)!;
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
      // Record canonical English source text once
      if (!originalTextMap.current.has(node)) {
        originalTextMap.current.set(node, node.nodeValue || '');
      }

      const originalText = originalTextMap.current.get(node) || node.nodeValue || '';
      const trimmed = originalText.trim();

      if (!isNonTranslatable(trimmed)) {
        const lower = trimmed.toLowerCase();

        // 1. Static dictionary check
        if (flatMap && flatMap.has(lower)) {
          const trans = flatMap.get(lower)!;
          // Retain surrounding whitespace
          const leadingWs = originalText.match(/^\s*/)?.[0] || '';
          const trailingWs = originalText.match(/\s*$/)?.[0] || '';
          node.nodeValue = `${leadingWs}${trans}${trailingWs}`;
        }
        // 2. Client cache check
        else if (cache.has(trimmed)) {
          const trans = cache.get(trimmed)!;
          const leadingWs = originalText.match(/^\s*/)?.[0] || '';
          const trailingWs = originalText.match(/\s*$/)?.[0] || '';
          node.nodeValue = `${leadingWs}${trans}${trailingWs}`;
        }
        // 3. Queue for translation
        else {
          if (!pendingNodes.current.has(trimmed)) {
            pendingNodes.current.set(trimmed, []);
          }
          pendingNodes.current.get(trimmed)!.push(node);
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
      if (language !== 'en') {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          translateDOM();
        }, 200);
      }
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
