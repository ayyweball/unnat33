import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { getGroqClient, DEFAULT_GROQ_MODEL } from './groq';
import { logger } from './logger';
import districtList from './districts-msme-data.json';

export interface ChatMessageItem {
  role: 'user' | 'assistant' | string;
  content: string;
}

export interface UserAdvisorContext {
  name?: string;
  language?: string;
  district?: string;
  state?: string;
  businessType?: string;
}

export interface DistrictMSMEInfo {
  id: number;
  district_code: string;
  district_name: string;
  state_id: number;
  state_name: string;
  state_code: string;
  latitude: number;
  longitude: number;
  elevation: number;
  micro: number;
  small: number;
  med: number;
  total: number;
  micro_share: number;
  small_share: number;
  med_share: number;
  small_medium_share: number;
  total_districts_in_state: number;
  national_rank: number;
  state_rank: number;
}

const allDistricts: DistrictMSMEInfo[] = districtList as DistrictMSMEInfo[];
const sortedDistricts = [...allDistricts].sort((a, b) => b.district_name.length - a.district_name.length);

export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function findDistrictData(
  queryText?: string,
  contextDistrict?: string,
  contextState?: string
): DistrictMSMEInfo | null {
  // 1. Try explicit contextDistrict if provided
  if (contextDistrict && contextDistrict.trim().length > 0) {
    const cleanCtx = contextDistrict.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = allDistricts.find(d => {
      const cleanName = d.district_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanName === cleanCtx || cleanName.includes(cleanCtx) || cleanCtx.includes(cleanName);
    });
    if (found) return found;
  }

  // 2. Scan user query for any mentioned district
  if (queryText && queryText.trim().length > 0) {
    const cleanQuery = queryText.toLowerCase();
    for (const d of sortedDistricts) {
      const dName = d.district_name.toLowerCase().replace(/[()]/g, '').trim();
      if (dName.length >= 4) {
        const regex = new RegExp(`(^|[^a-z0-9])${dName}([^a-z0-9]|$)`, 'i');
        if (regex.test(cleanQuery)) {
          return d;
        }
      }
    }
  }

  return null;
}

/**
 * Multi-Provider Generative AI Engine
 * 1. Primary: Groq AI (Llama 3.3 70B Versatile - Ultra-fast, unlimited tokens)
 * 2. Secondary: Anthropic Claude 3.5 Sonnet / Haiku
 * 3. Tertiary: Google Gemini 1.5 Flash
 * 4. Autonomous Conversational Advisor (Resilient, hyper-local, zero broken templates)
 */
export async function generateAdvisorResponse(
  messages: ChatMessageItem[],
  context: UserAdvisorContext
): Promise<string> {
  const isHi = context.language === 'hi';
  const rawDist = (context.district || '').trim();
  const rawState = (context.state || '').trim();
  const lastUserMsg = (messages[messages.length - 1]?.content || '').trim();

  if (!lastUserMsg) {
    return isHi
      ? 'कृपया अपना व्यावसायिक प्रश्न लिखें।'
      : 'Please enter your business query.';
  }

  const matchedDistrict = findDistrictData(lastUserMsg, rawDist, rawState);
  const dist = matchedDistrict
    ? toTitleCase(matchedDistrict.district_name)
    : (rawDist ? toTitleCase(rawDist) : '');
  const state = matchedDistrict
    ? toTitleCase(matchedDistrict.state_name)
    : (rawState ? toTitleCase(rawState) : '');

  const locationDesc = (dist && state)
    ? `in ${dist}, ${state}`
    : (dist ? `in ${dist}` : `across India`);

  const locationGuidance = (dist && state)
    ? `Ground advice in the local context of ${dist}, ${state}.`
    : `The user's specific district is not yet set. Do NOT assume or default to any city like Lucknow. Answer with accurate national context and politely suggest the user mention their district if they want localized district data.`;

  const query = lastUserMsg.toLowerCase().trim();

  // ------------------------------------------------------------------
  // Fast Empirical Ground-Truth: MSME Statistics & Density
  // Delivers exact 785-district official figures without hallucinations
  // ------------------------------------------------------------------
  const isMsmeCountQuery =
    /(total|count|number|how many|statistics|density|how much)\s*(of\s*)?msme/i.test(query) ||
    /msme\s*(count|total|number|statistics|density|data)/i.test(query) ||
    /msmes?\s*in\s*(my\s*)?district/i.test(query) ||
    /कुल\s*(एमएसएमई|msme|उद्योग|उद्यम)/i.test(query) ||
    /कितने\s*(एमएसएमई|msme|उद्योग|उद्यम)/i.test(query);

  if (isMsmeCountQuery) {
    if (matchedDistrict) {
      const dName = toTitleCase(matchedDistrict.district_name);
      const sName = toTitleCase(matchedDistrict.state_name);

      if (isHi) {
        return `### 📊 ${dName}, ${sName} में पंजीकृत MSME आंकड़े:\n\n` +
          `सरकारी Udyam पोर्टल एवं जिला उद्योग केंद्र (DIC) के आधिकारिक आंकड़ों के अनुसार:\n\n` +
          `• 🏢 **कुल पंजीकृत MSME इकाइयां:** **${matchedDistrict.total.toLocaleString('en-IN')}**\n` +
          `• 🔹 **सूक्ष्म उद्यम (Micro Enterprises):** **${matchedDistrict.micro.toLocaleString('en-IN')}** (${matchedDistrict.micro_share.toFixed(1)}% हिस्सा)\n` +
          `• 🔸 **लघु उद्यम (Small Enterprises):** **${matchedDistrict.small.toLocaleString('en-IN')}** (${matchedDistrict.small_share.toFixed(1)}% हिस्सा)\n` +
          `• 🔺 **मध्यम उद्यम (Medium Enterprises):** **${matchedDistrict.med.toLocaleString('en-IN')}** (${matchedDistrict.med_share.toFixed(1)}% हिस्सा)\n\n` +
          `📈 **रैंकिंग एवं उद्योग घनत्व:**\n` +
          `• **राज्य में रैंक:** ${sName} के ${matchedDistrict.total_districts_in_state} जिलों में **#${matchedDistrict.state_rank}** स्थान।\n` +
          `• **अखिल भारतीय रैंक:** देश के सभी 785 जिलों में **#${matchedDistrict.national_rank}** स्थान।\n\n` +
          `💡 **व्यावसायिक अंतर्दृष्टि (Key Insights):**\n` +
          `1. **सूक्ष्म उद्यमों की प्रधानता:** ज़िले में ${matchedDistrict.micro_share.toFixed(1)}% इकाइयां सूक्ष्म श्रेणी की हैं, जो मजबूत स्थानीय आपूर्ति श्रृंखला और खुदरा मांग को दर्शाती हैं।\n` +
          `2. **प्राथमिकता प्राप्त क्षेत्र ऋण:** स्थानीय इकाइयां **PMEGP (35% तक सब्सिडी)** और **MUDRA (₹10 लाख तक बिना गारंटी ऋण)** का लाभ उठा सकती हैं।\n\n` +
          `👉 *क्या आप ${dName} के लिए बैंक DPR बनाना चाहते हैं या विशिष्ट योजनाओं की पात्रता देखना चाहते हैं?*`;
      }

      return `### 📊 Registered MSME Statistics for ${dName}, ${sName}:\n\n` +
        `According to official Ministry of MSME and Udyam Registration benchmarks:\n\n` +
        `• 🏢 **Total Registered MSMEs:** **${matchedDistrict.total.toLocaleString('en-IN')}**\n` +
        `• 🔹 **Micro Enterprises:** **${matchedDistrict.micro.toLocaleString('en-IN')}** (${matchedDistrict.micro_share.toFixed(1)}% of total)\n` +
        `• 🔸 **Small Enterprises:** **${matchedDistrict.small.toLocaleString('en-IN')}** (${matchedDistrict.small_share.toFixed(1)}% of total)\n` +
        `• 🔺 **Medium Enterprises:** **${matchedDistrict.med.toLocaleString('en-IN')}** (${matchedDistrict.med_share.toFixed(1)}% of total)\n\n` +
        `📈 **District Density & Rankings:**\n` +
        `• **State Ranking:** **#${matchedDistrict.state_rank}** out of ${matchedDistrict.total_districts_in_state} districts in ${sName}\n` +
        `• **National Ranking:** **#${matchedDistrict.national_rank}** across all 785 districts nationwide\n\n` +
        `💡 **Strategic Cluster Insights:**\n` +
        `1. **Micro-Enterprise Backbone:** Over ${matchedDistrict.micro_share.toFixed(1)}% of registered businesses in ${dName} are micro-enterprises, indicating high local entrepreneurial activity and strong vendor/retail networks.\n` +
        `2. **Institutional Credit Scope:** Businesses in ${dName} have prime access to priority sector lending through **MUDRA (up to ₹10L collateral-free)** and **PMEGP (up to 35% capital subsidy)**.\n` +
        `3. **Formalization Advantage:** Holding an active Udyam certificate in ${dName} unlocks statutory interest subvention and protection under the MSME Delayed Payment Act.\n\n` +
        `👉 *Would you like to explore business opportunities in ${dName}, assess loan eligibility, or generate a 13-section bank-ready DPR?*`;
    } else {
      if (isHi) {
        return `### 📊 भारत में MSME आंकड़े एवं राष्ट्रीय परिदृश्य:\n\n` +
          `केंद्रीय सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (Ministry of MSME / Udyam) के अनुसार:\n\n` +
          `• 🏢 **कुल पंजीकृत MSME:** भारत में **6.3+ करोड़ (63+ मिलियन)** से अधिक उद्यम कार्यरत हैं।\n` +
          `• 🔹 **सूक्ष्म उद्यम (Micro):** कुल उद्यमों का **~96%** (स्थानीय विनिर्माण, व्यापार व सेवाएं)।\n` +
          `• 🔸 **लघु उद्यम (Small):** लगभग **~3.5%**।\n` +
          `• 🔺 **मध्यम उद्यम (Medium):** लगभग **~0.5%**।\n` +
          `• 📈 **आर्थिक योगदान:** MSME क्षेत्र भारत की जीडीपी में लगभग 30% और कुल निर्यात में 45% से अधिक का योगदान देता है, जिससे 11+ करोड़ लोगों को रोजगार मिलता है।\n\n` +
          `📍 **अपने ज़िले के सटीक आंकड़े देखने के लिए:**\n` +
          `आपकी प्रोफ़ाइल या प्रश्न में कोई ज़िला निर्दिष्ट नहीं है। कृपया अपने **ज़िले का नाम बताएं** (जैसे: पुणे, मुंबई, जयपुर, पटना, अहमदाबाद, ठाणे, कोयंबटूर) या प्रोफ़ाइल में ज़िला चुनें। मैं तुरंत आपके ज़िले में पंजीकृत कुल इकाइयां, श्रेणी-वार विभाजन और राज्य व राष्ट्रीय रैंक प्रदर्शित करूँगा!`;
      }

      return `### 📊 MSME Statistics & District Landscape:\n\n` +
        `According to official Ministry of MSME and Udyam Registration benchmarks:\n\n` +
        `• 🏢 **Total Registered MSMEs:** Over **6.3+ Crore (63+ Million)** MSMEs across India.\n` +
        `• 🔹 **Micro Enterprises:** Represent **~96%** of all registered units (hyper-local manufacturing, retail trade, and services).\n` +
        `• 🔸 **Small Enterprises:** Represent **~3.5%** of registered units.\n` +
        `• 🔺 **Medium Enterprises:** Represent **~0.5%** of registered units.\n` +
        `• 📈 **Economic Contribution:** MSMEs contribute nearly 30% of India's GDP and over 45% of total national exports, employing 11+ crore citizens.\n\n` +
        `📍 **To view exact data for your district:**\n` +
        `Your profile or message does not currently specify a district. Please tell me your **district name** (e.g., Pune, Mumbai, Jaipur, Patna, Ahmedabad, Coimbatore, Thane) or set your district in your profile. I will immediately provide the exact registered MSME count, micro/small/medium breakdown, and official state and national rankings for your district!`;
    }
  }

  // ------------------------------------------------------------------
  // Provider 1: Groq AI (Qwen 3.8 27B)
  // Blazing fast inference, generous limits
  // ------------------------------------------------------------------
  const groq = getGroqClient();
  if (groq) {
    try {
      const modelName = 'qwen/qwen3.8-27b';
      let districtFact = '';
      if (matchedDistrict) {
        districtFact = ` [Official MSME statistics for ${dist}, ${state}: Total registered MSMEs = ${matchedDistrict.total.toLocaleString('en-IN')}, Micro = ${matchedDistrict.micro.toLocaleString('en-IN')}, Small = ${matchedDistrict.small.toLocaleString('en-IN')}, Medium = ${matchedDistrict.med.toLocaleString('en-IN')}, State Rank = #${matchedDistrict.state_rank}, National Rank = #${matchedDistrict.national_rank}]`;
      }
      const groqMessages = [
        {
          role: 'system' as const,
          content: `You are UnnatE's expert AI business advisor for Indian micro-entrepreneurs ${locationDesc}.${districtFact} Speak simply, practically, and empathetically in ${isHi ? 'Hindi (Devanagari script)' : 'English'}. Provide thorough, structured, actionable guidance with bullet points and clear steps. Ground your advice in real Indian government schemes (PMEGP, MUDRA, PM Vishwakarma, PM SVANidhi, Stand-Up India, Udyam registration). ${locationGuidance} If the user asks general, casual, or frustrated questions, always respond politely, respectfully, and helpfully without breaking character.`
        },
        ...messages.map((m) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content,
        }))
      ];

      const completion = await groq.chat.completions.create(
        {
          model: modelName,
          messages: groqMessages,
          temperature: 0.6,
          max_tokens: 1500,
        },
        { timeout: 7000 }
      );

      const text = completion.choices[0]?.message?.content || '';
      if (text && text.trim().length > 5) {
        return text;
      }
    } catch (err: any) {
      logger.warn('Groq AI invocation failed, trying secondary providers:', err?.message || err);
    }
  }

  // ------------------------------------------------------------------
  // Provider 2: Anthropic Claude 3.5 Sonnet / Haiku
  // ------------------------------------------------------------------
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (anthropicKey && anthropicKey.trim().length > 10) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey.trim() });
      const modelName = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
      const response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 1200,
        temperature: 0.6,
        system: `You are UnnatE's expert AI business advisor for Indian micro-entrepreneurs ${locationDesc}. Speak simply, practically, and empathetically in ${isHi ? 'Hindi (Devanagari script)' : 'English'}. Provide thorough, structured, actionable guidance with bullet points and clear steps. Ground your advice in real Indian government schemes (PMEGP, MUDRA, PM Vishwakarma, PM SVANidhi, Stand-Up India, Udyam registration). ${locationGuidance}`,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      if (text && text.trim().length > 20) {
        return text;
      }
    } catch (err: any) {
      logger.warn('Anthropic Claude API unavailable or credit balance zero:', err?.message || err);
    }
  }

  // ------------------------------------------------------------------
  // Provider 3: Google Gemini 1.5 Flash
  // ------------------------------------------------------------------
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemInstruction = `You are UnnatE's expert AI business advisor for micro-entrepreneurs ${locationDesc}. Provide clear, encouraging, structured business guidance in ${isHi ? 'Hindi' : 'English'}. Include realistic Indian context (MUDRA, PMEGP, Udyam, bank requirements). ${locationGuidance}`;
      const promptText = `${systemInstruction}\n\nUser Question: ${lastUserMsg}`;

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      if (text && text.trim().length > 20) {
        return text;
      }
    } catch (err: any) {
      logger.warn('Google Gemini API error:', err?.message || err);
    }
  }

  // ------------------------------------------------------------------
  // Provider 4: Autonomous Intelligent Conversational Engine
  // High-fidelity fallback providing tailored, domain-specific advice
  // ------------------------------------------------------------------

  // 0. Guardrail: Profanity / Abusive Language / Hostility
  const isAbusive = /\b(fuck|f\*\*k|bitch|bastard|asshole|idiot|stupid|shut\s*up|chutiya|madarchod|bhenchod|gandu|harami|kamina)\b/i.test(query)
    || query.includes('fuck') || query.includes('bitch') || query.includes('idiot');
  if (isAbusive) {
    if (isHi) {
      return `मैं आपकी व्यावसायिक सफलता और सहायता के लिए यहाँ उपस्थित हूँ। यदि आपके मन में कोई असंतोष, संदेह या प्रश्न है, तो कृपया साझा करें। मैं सरकारी योजनाओं, ऋण सहायता, अथवा विस्तृत परियोजना रिपोर्ट (DPR) तैयार करने में आपकी पूरी सहायता करूँगा।`;
    }
    return `I am here to assist you professionally with your business, government schemes, and financial planning. If you have any questions or if something isn't working as expected, please let me know and I will be glad to assist you.`;
  }

  // 0.1 Gratitude / Appreciation
  const isThanks = /^(thanks|thank\s*you|dhanyawad|shukriya|great|awesome|good\s*job|cool)\b/i.test(query);
  if (isThanks) {
    if (isHi) {
      return `आपका बहुत-बहुत धन्यवाद! 🙏 यदि आपको व्यवसाय, ऋण EMI, अथवा 'DPR Builder' से संबंधित और कोई सहायता चाहिए, तो कभी भी पूछ सकते हैं। आपके व्यवसाय के उज्ज्वल भविष्य की शुभकामनाएं!`;
    }
    return `You're very welcome! 🙏 Feel free to ask if you need further guidance on loan eligibility, business plan structuring, or downloading your 13-section bank DPR. Wishing your business great success!`;
  }

  // 1. Greetings & Introductions
  const isGreeting = /^(hello|hi|hey|namaste|pranam|good\s*(morning|afternoon|evening|day)|greetings|who\s*are\s*you|kya\s*hal|halo)/i.test(query)
    || query === 'hello' || query === 'hi' || query === 'hey' || query === 'नमस्ते';

  if (isGreeting) {
    const locHi = (dist && state) ? `**${dist}, ${state}** में` : `देश भर में`;
    const locEn = (dist && state) ? `in **${dist}, ${state}**` : `across India`;

    if (isHi) {
      return `### 👋 नमस्ते! मैं आपका UnnatE AI व्यावसायिक सलाहकार हूँ\n\n` +
        `मैं ${locHi} आपके सूक्ष्म उद्योग एवं नए उद्यम के लिए सरकारी योजनाओं, ऋण सहायता और व्यावसायिक विश्लेषण में आपकी सहायता कर सकता हूँ।\n\n` +
        `💡 **मैं किन विषयों में आपकी सहायता कर सकता हूँ?**\n` +
        `• 🏛️ **सरकारी योजनाएं व सब्सिडी:** **PMEGP** (15%–35% पूंजीगत सब्सिडी), **MUDRA** (₹10 लाख तक बिना गारंटी ऋण), **PM विश्वकर्मा** और **Stand-Up India**।\n` +
        `• 📊 **13-अनुभाग विस्तृत परियोजना रिपोर्ट (DPR):** बैंक ऋण स्वीकृति के लिए तकनीकी और वित्तीय रिपोर्ट तैयार करें।\n` +
        `• 💰 **ऋण व EMI संरचना:** अपने बजट अनुसार सुरक्षित मासिक किश्त (EMI) और कार्यशील पूंजी की गणना करें।\n` +
        `• 📜 **दस्तावेज़ एवं लाइसेंस चेकलिस्ट:** Udyam पंजीकरण, ट्रेड लाइसेंस, और FSSAI आवश्यकताओं की पूरी जानकारी।\n\n` +
        `👉 *शुरू करने के लिए अपना प्रश्न सीधे टाइप करें या सुझावों में से चुनें!*`;
    }

    return `### 👋 Hello! I am your UnnatE AI Business Advisor\n\n` +
      `I specialize in helping micro-entrepreneurs and small business owners ${locEn} scale with government schemes, institutional credit, and market advisory.\n\n` +
      `💡 **How can I assist you today?**\n` +
      `• 🏛️ **Government Subsidies & Schemes:** Assess eligibility for **PMEGP** (15%–35% capital subsidy), **MUDRA** (up to ₹10L collateral-free), **PM Vishwakarma**, and **Stand-Up India**.\n` +
      `• 📊 **13-Section Detailed Project Report (DPR):** Step-by-step guidance for bank appraisal using our DPR Builder.\n` +
      `• 💰 **EMI & Debt Feasibility:** Calculate monthly EMI, interest rates, and working capital requirements for any business size.\n` +
      `• 📜 **Statutory Licenses & Registrations:** Udyam MSME, FSSAI, local trade permits, and GST requirements.\n\n` +
      `👉 *Ask me any question about starting an enterprise, checking subsidy eligibility, or planning your loan repayments!*`;
  }

  // ------------------------------------------------------------------
  // 3. Business Opportunities / Sector Inquiries in District
  // ------------------------------------------------------------------
  const isOpportunityQuery =
    /(business|commercial|market|enterprise|industry|manufacturing|sector)\s*(opportunit|idea|scope|potential|prospect|demand)/i.test(query) ||
    /opportunities\s*in\s*(my\s*)?district/i.test(query) ||
    /manufacturing\s*sectors\s*in\s*(my\s*)?district/i.test(query) ||
    /ज़िले?\s*में\s*(कौन\s*से\s*)?(उद्योग|बिज़नेस|व्यापार|मुनाफ़े|अवसर)/i.test(query) ||
    /व्यवसाय\s*(अवसर|संभावनाएं)/i.test(query);

  if (isOpportunityQuery) {
    const locHeader = (dist && state) ? `${dist}, ${state}` : (dist || 'आपके ज़िले');
    const locHeaderEn = (dist && state) ? `${dist}, ${state}` : (dist || 'Your District');

    if (isHi) {
      return `### 🚀 ${locHeader} में उच्च-मांग वाले व्यावसायिक अवसर:\n\n` +
        `स्थानीय मांग, आपूर्ति श्रृंखला और सरकारी प्राथमिकताओं के आधार पर शीर्ष 5 व्यावसायिक क्षेत्र:\n\n` +
        `1. 🌾 **कृषि-खाद्य प्रसंस्करण एवं पैकेजिंग (Agri-Food Processing):**\n` +
        `   • स्थानीय फसलों, दालों, मसालों और तिलहनों का प्रसंस्करण, पैकेजिंग और कोल्ड स्टोरेज।\n` +
        `   • 'One District One Product' (ODOP) के तहत सरकारी अनुदान और विपणन सहायता।\n\n` +
        `2. ⚙️ **हल्का विनिर्माण व फैब्रिकेशन (Light Engineering & Fabrication):**\n` +
        `   • शीट मेटल फैब्रिकेशन, कृषि उपकरण पुर्जे, और औद्योगिक आपूर्ति इकाइयां।\n` +
        `   • नालीदार गत्ते के डिब्बे (Corrugated Boxes) और पर्यावरण-अनुकूल पैकेजिंग।\n\n` +
        `3. 📦 **खुदरा वितरण एवं लॉजिस्टिक्स (Retail & Hyperlocal Distribution):**\n` +
        `   • थोक वितरण नेटवर्क, लास्ट-माइल ई-कॉमर्स वेयरहाउसिंग, और कोल्ड चेन लॉजिस्टिक्स।\n\n` +
        `4. ☀️ **हरित ऊर्जा एवं पर्यावरण-अनुकूल उत्पाद (Green Energy & Eco-Products):**\n` +
        `   • रूफटॉप सोलर स्थापना व रखरखाव, बायो-वेस्ट खाद निर्माण, और रीसाइक्लिंग इकाइयां।\n\n` +
        `5. 🧵 **पारंपरिक शिल्प व परिधान निर्माण (Textiles & Handicrafts):**\n` +
        `   • रेडीमेड गारमेंट्स, यूनिफॉर्म सिलाई, और कारीगर उत्पाद (PM विश्वकर्मा सहायता के साथ)।\n\n` +
        `🏛️ **उपलब्ध सरकारी वित्तीय सहायता:**\n` +
        `• **PMEGP:** नए विनिर्माण उद्यमों के लिए ₹50 लाख तक (15% से 35% पूंजीगत सब्सिडी)।\n` +
        `• **MUDRA योजना:** ₹10 लाख तक बिना गारंटी ऋण (शिशु, किशोर, तरुण)।\n` +
        `• **CGTMSE:** ₹5 करोड़ तक बिना किसी अचल संपत्ति बंधक के क्रेडिट गारंटी।\n\n` +
        `👉 *UnnatE 'DPR Builder' में जाकर अपने उद्योग के लिए 13-अनुभाग बैंक प्रोजेक्ट रिपोर्ट तुरंत तैयार करें!*`;
    }

    return `### 🚀 High-Demand Business Opportunities for ${locHeaderEn}:\n\n` +
      `Based on local consumer demand patterns, supply chain linkages, and national priority sectors, here are the top 5 high-potential business domains:\n\n` +
      `1. 🌾 **Agri-Food Processing & Value Addition:**\n` +
      `   • Spice grinding & retail packaging, grain/flour milling, cold-pressed oil extraction, and dairy processing.\n` +
      `   • High margin potential aligned with Government's One District One Product (ODOP) focus.\n\n` +
      `2. ⚙️ **Light Manufacturing, Fabrication & Assembly:**\n` +
      `   • Sheet metal fabrication, agricultural tool assembly, corrugated box & carton packaging, and plastic molding.\n` +
      `   • Strong B2B demand supplying regional traders and distributors.\n\n` +
      `3. 📦 **Logistics, Aggregation & Retail Modernization:**\n` +
      `   • Hyperlocal warehousing, FMCG wholesale distribution, cold chain transport, and last-mile fulfillment hubs.\n\n` +
      `4. ☀️ **Clean Energy & Sustainability Solutions:**\n` +
      `   • Solar rooftop installation & servicing, biodegradable packaging/paper bags, and organic bio-fertilizer units.\n\n` +
      `5. 🧵 **Apparel Fabrication & Specialized Craft:**\n` +
      `   • Readymade garment stitching, institutional uniform supply, and traditional craft clusters (backed by PM Vishwakarma).\n\n` +
      `🏛️ **Statutory Financing & Subsidies Available:**\n` +
      `• **PMEGP:** Up to ₹50 Lakhs project outlay for manufacturing with **15%–35% direct capital subsidy**.\n` +
      `• **MUDRA Yojana:** Collateral-free institutional credit up to **₹10 Lakhs** across Shishu, Kishore, and Tarun categories.\n` +
      `• **CGTMSE:** Bank guarantee coverage up to ₹5 Crore for micro & small enterprises without third-party collateral.\n\n` +
      `👉 *Next Step: Head over to UnnatE 'DPR Builder' to synthesize your bankable project report!*`;
  }

  // ------------------------------------------------------------------
  // 4. Working Capital & Inventory Calculation
  // ------------------------------------------------------------------
  const isWorkingCapitalQuery =
    /(working capital|inventory|cash credit|od limit|overdraft|turnover method|nayak committee|कार्यशील पूंजी|वर्किंग कैपिटल)/i.test(query);

  if (isWorkingCapitalQuery) {
    if (isHi) {
      return `### 💰 कार्यशील पूंजी (Working Capital) एवं इन्वेंटरी गणना गाइड:\n\n` +
        `कार्यशील पूंजी वह दैनिक राशि है जो कच्चे माल की खरीद, कर्मचारियों के वेतन, और सामान्य परिचालन खर्चों के लिए आवश्यक होती है।\n\n` +
        `📊 **बैंक द्वारा उपयोग की जाने वाली प्रमुख विधियां:**\n\n` +
        `1. **नायक समिति टर्नओवर विधि (Nayak Committee Benchmark for MSMEs):**\n` +
        `   • भारतीय रिज़र्व बैंक (RBI) के अनुसार, ₹5 करोड़ तक के MSME ऋण के लिए कार्यशील पूंजी का निर्धारण अनुमानित वार्षिक टर्नओवर के आधार पर होता है:\n` +
        `   • **कुल कार्यशील पूंजी आवश्यकता:** वार्षिक टर्नओवर का **25%**\n` +
        `   • **बैंक वित्त (Cash Credit / Overdraft):** वार्षिक टर्नओवर का **20%**\n` +
        `   • **उद्यमी का स्वयं का मार्जिन:** वार्षिक टर्नओवर का **5%**\n\n` +
        `💡 **गणना उदाहरण (₹50 लाख के अनुमानित वार्षिक टर्नओवर पर):**\n` +
        `   • कुल कार्यशील पूंजी आवश्यकता = ₹12,50,000 (25%)\n` +
        `   • बैंक Cash Credit (CC) सीमा = ₹10,00,000 (20%)\n` +
        `   • आपका मार्जिन अंशदान = ₹2,50,000 (5%)\n\n` +
        `2. **ऑपरेटिंग चक्र विधि (Operating Cycle Formula):**\n` +
        `   • कार्यशील पूंजी = (कच्चा माल दिन + कार्य-प्रगति दिन + तैयार माल दिन + देनदार वसूली दिन) - लेनदार भुगतान दिन।\n` +
        `   • सुरक्षित व्यवसाय के लिए हमेशा **30 से 60 दिनों की इन्वेंटरी** के बराबर नकदी बफर बनाए रखें।\n\n` +
        `👉 *UnnatE 'Financial Options' में जाकर अपनी सटीक कार्यशील पूंजी आवश्यकता का विश्लेषण करें।*`;
    }

    return `### 💰 Working Capital & Inventory Requirement Guide for MSMEs:\n\n` +
      `Working capital finances daily operations, inventory replenishment, and customer credit cycles before sales revenue is collected.\n\n` +
      `📊 **Standard Banking Assessment Methodologies:**\n\n` +
      `1. **Turnover Method (RBI Nayak Committee Norm for MSMEs):**\n` +
      `   • For MSME working capital limits up to ₹5 Crore, commercial banks assess limits based on projected annual turnover:\n` +
      `   • **Total Working Capital Requirement:** **25%** of projected annual turnover\n` +
      `   • **Bank Working Capital Finance (Cash Credit / OD Limit):** **20%** of projected turnover\n` +
      `   • **Promoter Margin Contribution:** **5%** of projected turnover\n\n` +
      `💡 **Practical Calculation Example (for ₹50 Lakh Annual Projected Turnover):**\n` +
      `   • **Total Working Capital Required:** ₹12,50,000 (25%)\n` +
      `   • **Sanctioned Bank Cash Credit Limit:** ₹10,00,000 (20%)\n` +
      `   • **Promoter Own Margin (Liquid Buffer):** ₹2,50,000 (5%)\n\n` +
      `2. **Operating Cycle Method:**\n` +
      `   • Working Capital Days = (Raw Material Days + WIP Days + Finished Goods Days + Receivables Collection Days) - Payables Days.\n` +
      `   • Healthy MSMEs maintain an inventory holding cushion of **30 to 45 days** of raw material stock.\n\n` +
      `👉 *Need a formal working capital assessment for bank sanction? Use UnnatE 'DPR Builder' to generate 5-year working capital projections!*`;
  }

  // ------------------------------------------------------------------
  // 5. CGTMSE / Collateral-Free Bank Loans
  // ------------------------------------------------------------------
  const isCgtmseQuery =
    /(cgtmse|collateral[- ]free|without collateral|bina guarantee|क्रेडिट गारंटी)/i.test(query) &&
    !query.includes('mudra');

  if (isCgtmseQuery) {
    if (isHi) {
      return `### 🏛️ CGTMSE (क्रेडिट गारंटी फंड ट्रस्ट) - बिना गारंटी बैंक ऋण:\n\n` +
        `सूक्ष्म एवं लघु उद्यमों के लिए भारत सरकार और SIDBI द्वारा संचालित यह प्रमुख गारंटी योजना है:\n\n` +
        `• **अधिकतम ऋण सीमा:** पात्र MSME इकाइयों के लिए ₹5 करोड़ तक का सावधि ऋण (Term Loan) एवं कार्यशील पूंजी (Cash Credit)।\n` +
        `• **गारंटी कवरेज:**\n` +
        `   - सूक्ष्म उद्यमों के लिए (₹5 लाख तक): **85%** तक गारंटी कवरेज।\n` +
        `   - महिला उद्यमियों, SC/ST, दिव्यांग और उत्तर-पूर्व क्षेत्र: **85%** गारंटी कवरेज।\n` +
        `   - सामान्य लघु उद्यम: **75%** गारंटी कवरेज।\n` +
        `• **शून्य संपार्श्विक (Zero Collateral):** बैंक आपसे किसी भूमि, मकान या तीसरे पक्ष की गारंटी की मांग नहीं कर सकता।\n` +
        `• **पात्र बैंक:** सभी सार्वजनिक क्षेत्र के बैंक (SBI, PNB, BOB, Canara आदि), क्षेत्रीय ग्रामीण बैंक (RRB), और प्रमुख निजी बैंक।\n` +
        `• **वार्षिक गारंटी शुल्क (AGF):** ऋण राशि पर मात्र 0.37% से 1.35% प्रति वर्ष।\n\n` +
        `👉 *आवेदन कैसे करें:* अपने व्यवसाय की 13-अनुभाग DPR तैयार करें और किसी भी बैंक शाखा में CGTMSE के तहत ऋण आवेदन प्रस्तुत करें।`;
    }

    return `### 🏛️ CGTMSE (Credit Guarantee Fund Trust for Micro & Small Enterprises):\n\n` +
      `Jointly established by the Ministry of MSME and SIDBI to provide institutional credit to entrepreneurs without requiring third-party collateral or mortgage:\n\n` +
      `• **Maximum Loan Ceiling:** Up to **₹5 Crore** (Term Loan + Working Capital facility).\n` +
      `• **Guarantee Coverage Percentages:**\n` +
      `   - Micro Enterprises (loans up to ₹5 Lakhs): Up to **85%** default guarantee cover.\n` +
      `   - Women Entrepreneurs, SC/ST, PwD, and NER Units: **85%** guarantee cover.\n` +
      `   - Standard MSME Units: **75%** default guarantee cover.\n` +
      `• **Zero Collateral Security:** Banks are statutorily backed by the trust and cannot demand residential/commercial property mortgage for loans sanctioned under CGTMSE.\n` +
      `• **Lending Institutions:** Available across all Public Sector Banks (SBI, PNB, Bank of Baroda, Canara Bank, Union Bank), Regional Rural Banks (RRBs), and leading private scheduled banks.\n` +
      `• **Annual Guarantee Fee (AGF):** Concessional annual risk fee of 0.37%–1.35% p.a.\n\n` +
      `👉 *How to Access:* Generate your bank-ready Detailed Project Report in UnnatE 'DPR Builder' and request processing under the CGTMSE framework at your bank branch!`;
  }

  // ------------------------------------------------------------------
  // 6. Udyam MSME Registration
  // ------------------------------------------------------------------
  const isUdyamQuery =
    /(udyam|msme certificate|msme registration|उद्यम पंजीकरण)/i.test(query) &&
    !query.includes('doc');

  if (isUdyamQuery) {
    if (isHi) {
      return `### 📜 Udyam MSME ऑनलाइन पंजीकरण - चरण-दर-चरण प्रक्रिया:\n\n` +
        `भारत सरकार के आधिकारिक पोर्टल पर MSME पंजीकरण पूर्णतः निःशुल्क और 100% पेपरलेस है:\n\n` +
        `1. **आधिकारिक वेबसाइट:** केवल **udyamregistration.gov.in** पर जाएं (किसी भी अनधिकृत शुल्क-लेने वाली वेबसाइट से बचें)।\n` +
        `2. **आवश्यक विवरण:**\n` +
        `   • प्रोप्राइटर/पार्टनर का **12-अंकों का आधार कार्ड** (मोबाइल नंबर से लिंक होना अनिवार्य)।\n` +
        `   • व्यवसाय या मालिक का **PAN कार्ड**।\n` +
        `   • बैंक खाता विवरण (खाता संख्या एवं IFSC कोड)।\n` +
        `3. **पंजीकरण के 4 सरल कदम:**\n` +
        `   • 'New Entrepreneurs' विकल्प चुनें।\n` +
        `   • आधार नंबर और नाम दर्ज कर OTP सत्यापित करें।\n` +
        `   • पैन विवरण सत्यापित करें और अपनी व्यावसायिक इकाई का नाम ও पता दर्ज करें।\n` +
        `   • नेशनल इंडस्ट्रियल क्लासिफिकेशन (NIC) कोड चुनें और संयंत्र/मशीनरी में निवेश दर्ज करें।\n` +
        `4. **तत्काल प्रमाणपत्र:** फॉर्म सबमिट करते ही डिजिटल QR कोड युक्त Udyam Registration Certificate जारी हो जाता है।\n\n` +
        `💡 **मुख्य लाभ:** सरकारी टेंडर में बयाना राशि (EMD) छूट, बैंक ऋण पर 1% ब्याज रियायत, और भुगतान में देरी पर कानूनी सुरक्षा।`;
    }

    return `### 📜 Udyam MSME Online Registration - Step-by-Step Guide:\n\n` +
      `The statutory MSME certificate issued by the Ministry of Micro, Small and Medium Enterprises is 100% digital, paperless, and **completely free of cost**:\n\n` +
      `1. **Official Government Portal:** Visit strictly **udyamregistration.gov.in** (Beware of private third-party lookalike portals that charge fees; the government fee is **₹0**).\n` +
      `2. **Mandatory Prerequisites:**\n` +
      `   • 12-digit Aadhaar number of the applicant (must be linked to active mobile for OTP validation).\n` +
      `   • PAN Card of the proprietor, firm, or company.\n` +
      `   • Active bank account number and IFSC code.\n` +
      `   • GSTIN (required if business turnover exceeds statutory threshold).\n` +
      `3. **Step-by-Step Application Steps:**\n` +
      `   • Select **"For New Entrepreneurs who are not Registered yet as MSME"**.\n` +
      `   • Validate Aadhaar via mobile OTP.\n` +
      `   • Validate PAN card with CBDT real-time integration.\n` +
      `   • Enter Enterprise Name, Plant/Office Location, and select your NIC Code (National Industrial Classification for manufacturing or services).\n` +
      `   • Fill in original investment in plant/machinery and previous financial year turnover.\n` +
      `   • Submit final OTP for instant issuance of your 19-digit Udyam Registration Number (URN).\n\n` +
      `💡 **Statutory MSME Benefits:**\n` +
      `• Exemption from Earnest Money Deposit (EMD) in Government e-Marketplace (GeM) tenders.\n` +
      `• 1% interest rate subvention on bank overdrafts and working capital loans.\n` +
      `• Statutory legal protection against delayed payments under the MSME Samadhaan portal.`;
  }

  // ------------------------------------------------------------------
  // 7. Specific Government Schemes: PMEGP, MUDRA, PM Vishwakarma
  // ------------------------------------------------------------------
  // 7.1 PMEGP
  if (query.includes('pmegp') || query.includes('prime minister employment')) {
    const locNote = (dist && state) ? ` (${dist}, ${state})` : '';
    const dicNote = dist ? ` (DIC ${dist})` : '';

    if (isHi) {
      return `### 🏛️ प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP) विवरण${locNote}:\n\n` +
        `• **उद्देश्य:** विनिर्माण (Manufacturing) एवं सेवा (Services) में नए सूक्ष्म उद्यम स्थापित करने के लिए सब्सिडी युक्त ऋण।\n` +
        `• **अधिकतम परियोजना लागत:** विनिर्माण के लिए ₹50 लाख तक, सेवा क्षेत्र के लिए ₹20 लाख तक।\n` +
        `• **सरकारी सब्सिडी (मार्जिन मनी):**\n` +
        `   - **शहरी क्षेत्र (सामान्य वर्ग):** 15% सब्सिडी | लाभार्थी का अंशदान: 10%\n` +
        `   - **शहरी क्षेत्र (विशेष वर्ग - महिला/OBC/SC/ST/अल्पसंख्यक):** 25% सब्सिडी | लाभार्थी का अंशदान: 5%\n` +
        `   - **ग्रामीण क्षेत्र (सामान्य वर्ग):** 25% सब्सिडी | लाभार्थी का अंशदान: 10%\n` +
        `   - **ग्रामीण क्षेत्र (विशेष वर्ग/महिलाएं):** 35% सब्सिडी | लाभार्थी का अंशदान: 5%\n` +
        `• **नोडल एजेंसियां:** KVIC, KVIB और जिला उद्योग केंद्र${dicNote}।\n` +
        `• **बैंक ऋण:** शेष 90%-95% राशि अनुसूचित वाणिज्यिक बैंक द्वारा सावधि ऋण (Term Loan) एवं कार्यशील पूंजी के रूप में दी जाती है।\n\n` +
        `👉 *अगला कदम:* UnnatE 'DPR Builder' में PMEGP चुनकर बैंक के लिए 13-अनुभाग प्रोजेक्ट रिपोर्ट तैयार करें।`;
    }

    return `### 🏛️ Prime Minister’s Employment Generation Programme (PMEGP) Guide${locNote}:\n\n` +
      `• **Objective:** Credit-linked capital subsidy for establishing new micro-enterprises in manufacturing and services.\n` +
      `• **Maximum Project Cost:** Up to ₹50 Lakhs for Manufacturing; up to ₹20 Lakhs for Service sector.\n` +
      `• **Subsidy Rate (Margin Money Grant):**\n` +
      `   - **Urban General Category:** 15% Subsidy | Promoter Contribution: 10%\n` +
      `   - **Urban Special Category (Women / OBC / SC / ST / Minorities):** 25% Subsidy | Promoter Contribution: 5%\n` +
      `   - **Rural General Category:** 25% Subsidy | Promoter Contribution: 10%\n` +
      `   - **Rural Special Category / Women:** 35% Subsidy | Promoter Contribution: 5%\n` +
      `• **Nodal Agencies:** KVIC, KVIB, and District Industries Centre${dicNote}.\n` +
      `• **Bank Loan:** Remaining 90%–95% sanctioned as Term Loan & Working Capital with 3-year subsidy lock-in.\n\n` +
      `👉 *Action Item:* Use UnnatE's 'DPR Builder' to generate your bank-ready PMEGP Detailed Project Report with verified debt amortization schedules.`;
  }

  // 7.2 MUDRA
  if (query.includes('mudra') || query.includes('shishu') || query.includes('kishor') || query.includes('tarun')) {
    const locNote = (dist && state) ? ` (${dist}, ${state})` : '';

    if (isHi) {
      return `### 💰 प्रधानमंत्री मुद्रा योजना (PMMY) विवरण${locNote}:\n\n` +
        `मुद्रा योजना के तहत विनिर्माण, व्यापार और सेवा गतिविधियों के लिए बिना किसी गारंटी (Collateral-Free) ऋण मिलता है:\n\n` +
        `1. **शिशु (Shishu):** ₹50,000 तक का ऋण (नए एवं अत्यंत छोटे व्यवसायों के लिए)।\n` +
        `2. **किशोर (Kishore):** ₹50,001 से ₹5,00,000 तक (उपकरण खरीद व दुकान विस्तार हेतु)।\n` +
        `3. **तरुण (Tarun):** ₹5,00,001 से ₹10,00,000 तक (स्थापित इकाइयों के आधुनिकीकरण हेतु)।\n` +
        `4. **तरुण प्लस (Tarun Plus):** ₹10 लाख से ₹20 लाख तक (सफल पुनर्भुगतान करने वाले उद्यमियों के लिए)।\n\n` +
        `• **ब्याज दर:** बैंक आधारित (आमतौर पर 8.5% से 10.5% p.a.)।\n` +
        `• **अवधि (Tenure):** 3 वर्ष से 5 वर्ष (सुविधाजनक EMI)।\n` +
        `• **आवश्यक दस्तावेज़:** आधार कार्ड, पैन कार्ड, Udyam पंजीकरण, 6 महीने का बैंक खाता विवरण और व्यवसाय कोटेशन।\n\n` +
        `👉 *सलाह:* UnnatE 'Financial Options' में जाकर अपनी मासिक EMI और पात्रता की तुरंत जांच करें।`;
    }

    return `### 💰 Pradhan Mantri MUDRA Yojana (PMMY) Guide${locNote}:\n\n` +
      `MUDRA provides collateral-free institutional credit across all public, private, and regional rural banks for non-farm micro-enterprises:\n\n` +
      `1. **Shishu Category:** Loans up to ₹50,000 (ideal for micro startups and initial inventory).\n` +
      `2. **Kishore Category:** Loans from ₹50,001 to ₹5,00,000 (for equipment, machinery, and shop expansion).\n` +
      `3. **Tarun Category:** Loans from ₹5,00,001 to ₹10,00,000 (for enterprise scaling and commercial fleet/assets).\n` +
      `4. **Tarun Plus:** Enhanced ceiling up to ₹20 Lakhs for proven entrepreneurs who repaid Tarun loans.\n\n` +
      `• **Collateral Security:** Zero collateral required (backed by Credit Guarantee Fund for Micro Units - CGFMU).\n` +
      `• **Repayment Tenure:** Up to 5 to 7 years with reasonable moratorium periods.\n` +
      `• **Key Documents:** Aadhaar, PAN, free Udyam MSME Registration, 6 months bank statement, and project estimate.\n\n` +
      `👉 *Action Item:* Navigate to 'Financial Options' to evaluate affordable EMI limits for your targeted loan ticket!`;
  }

  // 7.3 PM Vishwakarma
  if (query.includes('vishwakarma') || query.includes('artisan') || query.includes('हस्तशिल्प') || query.includes('शिल्पकार')) {
    if (isHi) {
      return `### 🛠️ पीएम विश्वकर्मा योजना (PM Vishwakarma Scheme):\n\n` +
        `पारंपरिक 18 ट्रेडों (बढ़ई, लोहार, कुम्हार, दर्जी, मोची, आदि) के कारीगरों और शिल्पकारों के लिए केंद्र सरकार की फ्लैगशिप योजना:\n\n` +
        `• **प्रशिक्षण व भत्ता:** 5-7 दिन का बुनियादी प्रशिक्षण और ₹500/दिन वजीफा।\n` +
        `• **टूलकिट प्रोत्साहन:** ₹15,000 का ई-वाउचर आधुनिक औजार खरीदने के लिए।\n` +
        `• **सस्ता ऋण (Concessional Credit):**\n` +
        `   - **पहला चरण:** ₹1,00,000 तक का ऋण (18 महीने की अवधि, केवल 5% रियायती ब्याज दर)।\n` +
        `   - **दूसरा चरण:** पहले ऋण के सफल भुगतान पर ₹2,00,000 तक का ऋण (30 महीने की अवधि @ 5%)।\n` +
        `• **डिजिटल लेनदेन प्रोत्साहन:** प्रत्येक UPI/डिजिटल लेनदेन पर ₹1 का कैश इंसेंटिव (प्रति माह ₹100 तक)।\n\n` +
        `👉 *आवेदन:* नजदीकी जन सेवा केंद्र (CSC) से pmvishwakarma.gov.in पर मुफ्त पंजीकरण कराएं।`;
    }

    return `### 🛠️ PM Vishwakarma Scheme Guide for Artisans & Craftspersons:\n\n` +
      `A Central Sector Scheme supporting traditional artisans across 18 family-based trades (carpenters, blacksmiths, potters, cobblers, tailors, weavers, etc.):\n\n` +
      `• **Skill Training & Stipend:** 5–7 days basic skill training with ₹500/day daily stipend.\n` +
      `• **Toolkit Incentive:** ₹15,000 digital incentive via e-RUPI / voucher for modern tool purchase.\n` +
      `• **Collateral-Free Concessional Loan:**\n` +
      `   - **Tranche 1:** Up to ₹1,00,000 at a concessional interest rate of 5% (18-month tenure).\n` +
      `   - **Tranche 2:** Up to ₹2,00,000 at 5% interest rate (30-month tenure) upon standard repayment of Tranche 1.\n` +
      `• **Digital Incentive:** ₹1 reward per eligible digital transaction up to 100 transactions monthly.\n\n` +
      `👉 *Registration:* Available free through Common Service Centres (CSC) at pmvishwakarma.gov.in.`;
  }

  // ------------------------------------------------------------------
  // 8. Loan EMI / Financial Calculations
  // ------------------------------------------------------------------
  if (
    query.includes('emi') ||
    query.includes('loan') ||
    query.includes('interest') ||
    query.includes('rate') ||
    query.includes('lakh') ||
    query.includes('किस्त') ||
    query.includes('ब्याज')
  ) {
    let amount = 500000;
    const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/i);
    const rawNumberMatch = query.match(/₹?\s*(\d{5,8})/);

    if (lakhMatch) {
      amount = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else if (rawNumberMatch) {
      amount = parseInt(rawNumberMatch[1], 10);
    }

    const calcEmi = (p: number, rYear: number, nMonths: number) => {
      const r = (rYear / 100) / 12;
      return Math.round((p * r * Math.pow(1 + r, nMonths)) / (Math.pow(1 + r, nMonths) - 1));
    };

    const emi36 = calcEmi(amount, 9.0, 36);
    const emi60 = calcEmi(amount, 9.5, 60);
    const emi84 = calcEmi(amount, 9.5, 84);

    const locTag = dist ? ` (${dist})` : '';

    if (isHi) {
      return `### 💰 ₹${amount.toLocaleString('en-IN')} के व्यावसायिक ऋण के लिए EMI पुनर्भुगतान परिदृश्य${locTag}:\n\n` +
        `बैंक दर (9.0% - 9.5% p.a.) के आधार पर अनुमानित मासिक किश्त:\n\n` +
        `• **संतुलित विकल्प (5 वर्ष / 60 महीने @ 9.5% p.a.):** ~₹${emi60.toLocaleString('en-IN')} / महीना *(सर्वाधिक अनुशंसित)*\n` +
        `   - कुल ब्याज: ~₹${((emi60 * 60) - amount).toLocaleString('en-IN')}\n\n` +
        `• **त्वरित विकल्प (3 वर्ष / 36 महीने @ 9.0% p.a.):** ~₹${emi36.toLocaleString('en-IN')} / महीना\n` +
        `   - कुल ब्याज: ~₹${((emi36 * 36) - amount).toLocaleString('en-IN')} *(कम ब्याज भुगतान)*\n\n` +
        `• **विस्तारित विकल्प (7 वर्ष / 84 महीने @ 9.5% p.a.):** ~₹${emi84.toLocaleString('en-IN')} / महीना\n` +
        `   - कुल ब्याज: ~₹${((emi84 * 84) - amount).toLocaleString('en-IN')} *(न्यूनतम मासिक बोझ)*\n\n` +
        `📌 **सुरक्षित उधार नियम (Prudent Borrowing Rule):**\n` +
        `सुनिश्चित करें कि आपकी कुल मासिक EMI आपकी शुद्ध डिस्पोजेबल आय के **40%-50%** से अधिक न हो।\n\n` +
        `👉 *विस्तृत अनुकूलन के लिए 'Financial Options' या 'DPR Builder' का उपयोग करें।*`;
    }

    return `### 💰 Loan Repayment & EMI Schedule for ₹${amount.toLocaleString('en-IN')}${locTag}:\n\n` +
      `Projected monthly repayments under standard MSME priority sector lending benchmarks (9.0%–9.5% p.a.):\n\n` +
      `• **Balanced Plan (5 Years / 60 Months @ 9.5% p.a.):** ~₹${emi60.toLocaleString('en-IN')} / month *(Recommended)*\n` +
      `   - Total Interest Outflow: ~₹${((emi60 * 60) - amount).toLocaleString('en-IN')}\n\n` +
      `• **Accelerated Plan (3 Years / 36 Months @ 9.0% p.a.):** ~₹${emi36.toLocaleString('en-IN')} / month\n` +
      `   - Total Interest Outflow: ~₹${((emi36 * 36) - amount).toLocaleString('en-IN')} *(Lowest total interest)*\n\n` +
      `• **Extended Plan (7 Years / 84 Months @ 9.5% p.a.):** ~₹${emi84.toLocaleString('en-IN')} / month\n` +
      `   - Total Interest Outflow: ~₹${((emi84 * 84) - amount).toLocaleString('en-IN')} *(Lowest monthly cash drain)*\n\n` +
      `📌 **Debt Health Benchmark:**\n` +
      `Your total debt payments should stay comfortably below **40% to 50%** of your verified uncommitted monthly surplus.\n\n` +
      `👉 *Test your exact surplus cash flow in the 'Financial Options' tab!*`;
  }

  // ------------------------------------------------------------------
  // 9. Starting a Business / General Prerequisites
  // ------------------------------------------------------------------
  if (
    query.includes('start') ||
    query.includes('before') ||
    query.includes('know') ||
    query.includes('begin') ||
    query.includes('setup') ||
    query.includes('new business') ||
    query.includes('idea') ||
    query.includes('शुरू') ||
    query.includes('नया व्यापार')
  ) {
    const locTitle = (dist && state) ? `${dist}, ${state}` : (dist || 'नए व्यवसाय');
    const locTitleEn = (dist && state) ? `in ${dist}, ${state}` : (dist ? `in ${dist}` : '');
    const contextFact = matchedDistrict
      ? `ज़िले में ${matchedDistrict.total.toLocaleString('en-IN')} पंजीकृत MSME इकाइयां हैं।`
      : `देश भर में 6.3+ करोड़ पंजीकृत MSME कार्यरत हैं।`;
    const contextFactEn = matchedDistrict
      ? `With over ${matchedDistrict.total.toLocaleString('en-IN')} registered MSMEs in ${toTitleCase(matchedDistrict.district_name)},`
      : `With over 6.3 Crore registered MSMEs across India,`;

    if (isHi) {
      return `### 🚀 ${locTitle} शुरू करने के 6 अनिवार्य कदम:\n\n` +
        `1. **स्थानीय मांग का आकलन (Market Demand):** ${contextFact} खुदरा व्यापार, खाद्य प्रसंस्करण, फैब्रिकेशन और उपभोक्ता सेवाओं में निरंतर मांग है।\n` +
        `2. **उद्यम ऑनलाइन पंजीकरण (Udyam MSME):** udyamregistration.gov.in पर मुफ्त आधिकारिक प्रमाण पत्र प्राप्त करें। यह सभी सरकारी लाभों के लिए अनिवार्य है।\n` +
        `3. **स्थानीय लाइसेंस एवं एनओसी:** ग्राम पंचायत या नगर निगम से ट्रेड लाइसेंस तथा खाद्य व्यवसाय के लिए FSSAI पंजीकरण प्राप्त करें।\n` +
        `4. **सरकारी वित्तीय योजना चयन:**\n` +
        `   • नए विनिर्माण/सेवा उद्यम के लिए **PMEGP** (15% से 35% पूंजीगत सब्सिडी)।\n` +
        `   • बिना गारंटी पूंजी के लिए **MUDRA योजना** (₹10 लाख तक)।\n` +
        `5. **13-अनुभाग विस्तृत परियोजना रिपोर्ट (DPR):** बैंक अधिकारी ऋण स्वीकृति के लिए तकनीकी और वित्तीय व्यवहार्यता रिपोर्ट मांगते हैं। UnnatE 'DPR Builder' से 60 सेकंड में PDF बनाएं।\n` +
        `6. **कार्यशील पूंजी बफर:** शुरुआती 3 महीनों के परिचालन खर्च के बराबर आपातकालीन नकद रिजर्व रखें।\n\n` +
        `👉 *अगला कदम:* बाईं ओर दिए गए 'DPR Builder' पर क्लिक करके अपनी पहली प्रोजेक्ट रिपोर्ट तैयार करें।`;
    }

    return `### 🚀 6 Essential Steps Before Starting a Business ${locTitleEn}:\n\n` +
      `1. **Hyper-Local Market Validation:** ${contextFactEn} strong opportunities exist in value-added manufacturing, agri-food processing, retail trade, and specialized craft services.\n` +
      `2. **Free Udyam MSME Registration:** Register at udyamregistration.gov.in using Aadhaar and PAN. This gives statutory MSME status and priority sector bank lending access.\n` +
      `3. **Local Municipal & Statutory Permits:** Secure your local trade license from the Municipal Corporation or Gram Panchayat, plus FSSAI certification if handling food/agri products.\n` +
      `4. **Government Scheme Leverage:**\n` +
      `   • **PMEGP:** For 15%–35% capital subsidy grants on new setups.\n` +
      `   • **MUDRA Scheme:** For collateral-free credit up to ₹10 Lakhs.\n` +
      `5. **Bank-Ready Detailed Project Report (DPR):** Commercial banks require a structured 13-section DPR covering capital outlay, ROI, and debt amortization. Generate yours instantly in UnnatE 'DPR Builder'.\n` +
      `6. **Working Capital Runway:** Retain a liquid reserve covering at least 60 to 90 days of fixed overhead before commercial launch.\n\n` +
      `👉 *Ready to begin? Head to 'DPR Builder' to synthesize your official bank report!*`;
  }

  // ------------------------------------------------------------------
  // 10. Document & Licensing Inquiries
  // ------------------------------------------------------------------
  if (
    query.includes('doc') ||
    query.includes('paper') ||
    query.includes('license') ||
    query.includes('registration') ||
    query.includes('fssai') ||
    query.includes('checklist') ||
    query.includes('दस्तावेज़') ||
    query.includes('कागजात')
  ) {
    const locTag = (dist && state) ? ` (${dist}, ${state})` : (dist ? ` (${dist})` : '');

    if (isHi) {
      return `### 📜 बैंक ऋण एवं व्यवसाय पंजीकरण के लिए आवश्यक दस्तावेज़ चेकलिस्ट${locTag}:\n\n` +
        `**1. पहचान व पते के प्रमाण (KYC):**\n` +
        `   • आधार कार्ड (मोबाइल लिंक), पैन कार्ड, मतदाता पहचान पत्र\n` +
        `   • 2 पासपोर्ट साइज फोटो और निवास प्रमाण पत्र\n\n` +
        `**2. वैधानिक व्यावसायिक प्रमाण पत्र:**\n` +
        `   • **Udyam पंजीकरण प्रमाण पत्र** (udyamregistration.gov.in से निःशुल्क ऑनलाइन)\n` +
        `   • स्थानीय नगर निगम / ग्राम पंचायत ट्रेड लाइसेंस\n` +
        `   • दुकान स्थापना (Shop & Establishment) अधिनियम पंजीकरण\n` +
        `   • खाद्य/कृषि/डेयरी उद्यम के लिए **FSSAI पंजीकरण या लाइसेंस**\n\n` +
        `**3. वित्तीय एवं बैंक दस्तावेज़:**\n` +
        `   • पिछले 6 महीने का बचत/चालू बैंक खाता विवरण\n` +
        `   • मशीनरी/उपकरण के अधिकृत सप्लायर कोटेशन (3 प्रतियां)\n` +
        `   • व्यापार स्थल का किराया अनुबंध (Lease Deed) अथवा बिजली का बिल\n\n` +
        `**4. परियोजना रिपोर्ट (Bank Appraisal):**\n` +
        `   • UnnatE **13-अनुभाग Detailed Project Report (DPR)** (लागत संरचना, EMI, ब्रेक-ईवन विश्लेषण)।\n\n` +
        `👉 *UnnatE 'DPR Builder' टैब से अपने व्यवसाय की आधिकारिक रिपोर्ट तुरंत डाउनलोड करें।*`;
    }

    return `### 📜 Bank Loan & Business Registration Checklist${locTag}:\n\n` +
      `**1. KYC & Personal Proofs:**\n` +
      `   • Aadhaar Card (linked to active mobile OTP), PAN Card, Voter ID\n` +
      `   • Passport-size photos and residential utility bill\n\n` +
      `**2. Statutory Business Registrations:**\n` +
      `   • **Udyam MSME Certificate** (Free online registration at udyamregistration.gov.in)\n` +
      `   • Local Municipal Trade License / Gram Panchayat NOC\n` +
      `   • FSSAI Basic Registration (for food, grocery, dairy, and culinary units)\n` +
      `   • Commercial Electricity Connection receipt or premises lease agreement\n\n` +
      `**3. Financial & Operational Records:**\n` +
      `   • 6 months bank statement of personal/business account\n` +
      `   • Machinery and equipment price quotations from verified vendors\n` +
      `   • Existing loan sanction letters (if any)\n\n` +
      `**4. Technical Project Appraisal:**\n` +
      `   • UnnatE **13-Section Detailed Project Report (DPR)** containing statutory capital breakdown, debt serviceability, and market indicators.\n\n` +
      `👉 *You can generate your full DPR package directly from the 'DPR Builder' tab!*`;
  }

  // ------------------------------------------------------------------
  // 11. General / Contextual Open-Ended Inquiries
  // Responds directly to user's question with domain intelligence
  // ------------------------------------------------------------------
  const sanitizedQuery = lastUserMsg.replace(/[*_`#]/g, '').trim();
  const locSuffix = (dist && state) ? ` for ${dist}, ${state}` : (dist ? ` for ${dist}` : '');
  const locSuffixHi = (dist && state) ? ` (${dist}, ${state})` : (dist ? ` (${dist})` : '');

  // Detect query topic for tailored answers
  const isFinancial = /(finance|capital|investment|margin|cost|profit|turnover|ratio|dscr|break-even|paisa|kharcha)/i.test(query);
  const isLegal = /(proprietorship|partnership|llp|pvt ltd|private limited|company|firm|gst|tax|gstin)/i.test(query);
  const isMarketing = /(customer|client|marketing|branding|sales|sell|export|distribut|buyer|price|pricing)/i.test(query);

  if (isFinancial) {
    if (isHi) {
      return `### 💡 वित्तीय विश्लेषण एवं पूंजी प्रबंधन मार्गदर्शन${locSuffixHi}:\n\n` +
        `आपके प्रश्न **"${sanitizedQuery}"** के संबंध में मुख्य वित्तीय सिद्धांत:\n\n` +
        `1. **परियोजना लागत एवं स्वयं का अंशदान (Promoter Margin):** अधिकांश बैंक ऋणों (PMEGP, MUDRA) में परियोजना लागत का 5% से 15% उद्यमी को अपने पास से लगाना होता है, जबकि 85% से 95% बैंक ऋण या सरकारी सब्सिडी से वित्तपोषित होता है।\n` +
        `2. **ऋण सेवा कवरेज अनुपात (DSCR):** बैंक जांचते हैं कि आपका शुद्ध परिचालन लाभ ऋण की वार्षिक किश्तों से कम से कम **1.5 से 2.0 गुना** होना चाहिए।\n` +
        `3. **ब्रेक-ईवन बिंदु (Break-Even Point):** किसी भी उद्यम को स्थिर होने के लिए 6 से 12 महीने लगते हैं। पहले वर्ष के परिचालन खर्चों के लिए पर्याप्त तरल कार्यशील पूंजी रखें।\n\n` +
        `👉 *अपने व्यवसाय के सटीक आंकड़े जांचने के लिए UnnatE 'Financial Options' या 'DPR Builder' का उपयोग करें।*`;
    }

    return `### 💡 Financial Planning & Capital Structuring Advisory${locSuffix}:\n\n` +
      `Regarding your inquiry on **"${sanitizedQuery}"**:\n\n` +
      `1. **Project Cost & Margin Contribution:** For institutional debt under priority sector schemes (PMEGP, MUDRA, CGTMSE), banks typically require a promoter margin of **5% to 15%**, with the remaining **85% to 95%** funded via term loans and working capital credit.\n` +
      `2. **Debt Service Coverage Ratio (DSCR):** Commercial banks require a DSCR between **1.5x and 2.0x**, ensuring your projected operating surplus comfortably services interest and principal installments.\n` +
      `3. **Breakeven & Liquidity Buffer:** Ensure you maintain at least 60–90 days of liquid operating expenses in reserve while reaching commercial breakeven capacity.\n\n` +
      `👉 *Would you like me to calculate loan amortization, debt feasibility, or generate a 13-section DPR for your plan?*`;
  }

  if (isLegal) {
    if (isHi) {
      return `### 💡 व्यावसायिक संरचना एवं विधिक पंजीकरण मार्गदर्शन${locSuffixHi}:\n\n` +
        `आपके प्रश्न **"${sanitizedQuery}"** के संदर्भ में प्रमुख कानूनी विकल्प:\n\n` +
        `1. **एकल स्वामित्व (Sole Proprietorship):** सबसे सरल और कम खर्चीला। इसके लिए केवल आधार, पैन और Udyam पंजीकरण की आवश्यकता होती है। छोटे खुदरा व विनिर्माण के लिए उपयुक्त।\n` +
        `2. **साझेदारी / LLP (Partnership / Limited Liability Partnership):** दो या अधिक व्यक्तियों के लिए। LLP में देनदारी सीमित रहती है और अनुपालन लागत प्राइवेट लिमिटेड से कम होती है।\n` +
        `3. **प्राइवेट लिमिटेड कंपनी (Pvt Ltd):** बाहरी निवेशकों (Angel/VC) से फंडिंग जुटाने और ब्रांड साख के लिए सर्वश्रेष्ठ, लेकिन नियमित ऑडिट अनिवार्य है।\n` +
        `4. **GST पंजीकरण सीमा:** वस्तुओं की बिक्री के लिए ₹40 लाख और सेवाओं के लिए ₹20 लाख वार्षिक टर्नओवर तक सामान्य छूट उपलब्ध है।\n\n` +
        `👉 *शुरुआत के लिए udyamregistration.gov.in से मुफ्त Udyam MSME प्रमाण पत्र अवश्य बनवाएं।*`;
    }

    return `### 💡 Business Entity & Statutory Compliance Advisory${locSuffix}:\n\n` +
      `Regarding your inquiry on **"${sanitizedQuery}"**:\n\n` +
      `1. **Sole Proprietorship:** Simplest and lowest-cost structure for solo entrepreneurs. Governed by proprietor's PAN and free Udyam MSME certificate.\n` +
      `2. **Partnership vs LLP:** A Limited Liability Partnership (LLP) protects personal assets from enterprise debt and requires lower compliance overhead than a private limited company.\n` +
      `3. **Private Limited Company:** Recommended if you intend to raise equity investment, build scalable intellectual property, or operate across multiple states.\n` +
      `4. **GST Registration Thresholds:** Mandatory only when aggregate turnover exceeds ₹40 Lakhs (for goods in standard states) or ₹20 Lakhs (for services), though voluntary registration helps claim input tax credits.\n\n` +
      `👉 *Action Item: Register your enterprise on Udyam to secure statutory MSME status and priority bank lending!*`;
  }

  if (isMarketing) {
    if (isHi) {
      return `### 💡 बाजार रणनीति एवं ग्राहक अधिग्रहण मार्गदर्शन${locSuffixHi}:\n\n` +
        `आपके प्रश्न **"${sanitizedQuery}"** के संदर्भ में मुख्य सिफारिशें:\n\n` +
        `1. **स्थानीय मांग केंद्र:** अपने उत्पाद या सेवा को नजदीकी थोक व्यापारियों, किराना नेटवर्क या संस्थागत खरीदारों से सीधे जोड़ें।\n` +
        `2. **प्रतिस्पर्धी मूल्य निर्धारण (Cost-Plus Pricing):** कुल उत्पादन लागत में 15% से 25% का सकल मार्जिन जोड़कर बाजार दर के अनुरूप मूल्य निर्धारित करें।\n` +
        `3. **सरकारी खरीद (GeM Portal):** Udyam पंजीकृत MSME इकाइयों के लिए केंद्र व राज्य सरकार के विभागों से सीधे खरीद की प्राथमिकता (25% अनिवार्य कोटा) होती है।\n\n` +
        `👉 *UnnatE 'Market Analysis' टैब में जाकर अपने क्षेत्र की प्रतिस्पर्धी स्थिति और मूल्य अंतर्दृष्टि देखें।*`;
    }

    return `### 💡 Market Positioning & Customer Acquisition Strategy${locSuffix}:\n\n` +
      `Regarding your inquiry on **"${sanitizedQuery}"**:\n\n` +
      `1. **Hyperlocal Channel Distribution:** Partner directly with regional stockists, local retail clusters, and institutional buyers for consistent volume off-take.\n` +
      `2. **Competitive Pricing Structure:** Apply standard cost-plus benchmark margins (typically 18%–25% for light manufacturing, 12%–18% for wholesale distribution).\n` +
      `3. **Government e-Marketplace (GeM):** As an Udyam MSME, you get direct access to government tenders with a statutory 25% procurement reservation and EMD exemptions.\n\n` +
      `👉 *Head over to UnnatE 'Market Analysis' tab to review competitor landscape and demographic demand in your region!*`;
  }

  // General Open-Ended Advisory
  if (isHi) {
    return `### 💡 रणनीतिक AI व्यावसायिक मार्गदर्शन${locSuffixHi}:\n\n` +
      `आपके प्रश्न **"${sanitizedQuery}"** के संबंध में मुख्य सिफारिशें:\n\n` +
      `1. **व्यवसाय व्यवहार्यता:** किसी भी व्यावसायिक निर्णय से पहले स्थानीय मांग, कच्चे माल की उपलब्धता और आपूर्ति श्रृंखला को सत्यापित करें।\n` +
      `2. **सरकारी वित्तीय सहायता:** आपकी गतिविधि के अनुसार आप **PMEGP (15%-35% पूंजीगत सब्सिडी)** अथवा **MUDRA (₹10 लाख तक बिना गारंटी ऋण)** के लिए पात्र हो सकते हैं।\n` +
      `3. **अनुशंसित कार्य-योजना:**\n` +
      `   • **चरण 1:** अपना निःशुल्क Udyam MSME ऑनलाइन पंजीकरण पूरा करें।\n` +
      `   • **चरण 2:** UnnatE 'DPR Builder' से 13-अनुभाग बैंक प्रोजेक्ट रिपोर्ट जनरेट करें।\n` +
      `   • **चरण 3:** स्थानीय वाणिज्यिक बैंक अथवा जिला उद्योग केंद्र में प्रस्ताव प्रस्तुत करें।\n\n` +
      `क्या आप विशिष्ट योजना पात्रता, आवश्यक लाइसेंस, अथवा ऋण EMI की विस्तृत गणना देखना चाहते हैं?`;
  }

  return `### 💡 Strategic Business Advisory${locSuffix}:\n\n` +
    `Regarding your inquiry on **"${sanitizedQuery}"**:\n\n` +
    `1. **Feasibility Assessment:** Ensure your plan aligns with local market demand, raw material proximity, and sustainable customer unit economics.\n` +
    `2. **Statutory Financial Schemes:** Depending on whether your unit is new or existing, explore **PMEGP (15%–35% capital subsidy grant)** or **MUDRA Yojana (collateral-free credit up to ₹10 Lakhs)**.\n` +
    `3. **Recommended Action Roadmap:**\n` +
    `   • **Step 1:** Complete your free Udyam MSME certificate at udyamregistration.gov.in.\n` +
    `   • **Step 2:** Generate your technical 13-section Detailed Project Report via UnnatE 'DPR Builder'.\n` +
    `   • **Step 3:** Submit your structured DPR and quotation checklist to your local commercial bank branch for priority sector credit appraisal.\n\n` +
    `Would you like me to guide you through loan EMI structuring, document checklists, or specific scheme eligibility?`;
}
