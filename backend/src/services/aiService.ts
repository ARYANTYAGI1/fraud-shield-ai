import { geminiClient, openaiClient } from '../config/ai';
import logger from '../config/logger';

export interface AIAnalysisResult {
  riskScore: number;
  category: 'Safe' | 'Suspicious' | 'Fraud' | 'High Risk Scam' | 'Critical';
  confidence: number;
  reasons: string[];
  recommendation: string;
  redFlags: string[];
}

const SYSTEM_PROMPT = `
You are a state-of-the-art cyber-security assistant specialized in fraud, scam, and phishing detection.
Your goal is to analyze the provided input (which could be email text, SMS, URL, chat transcripts, documents, or OCR results) and determine if it represents a threat.

You MUST respond strictly with a JSON object. Do not include any markdown formatting wrappers (like \`\`\`json ... \`\`\`), do not include any text before or after the JSON.
The JSON must adhere to this exact interface:
{
  "riskScore": number (0 to 100 representing the threat severity),
  "category": "Safe" | "Suspicious" | "Fraud" | "High Risk Scam",
  "confidence": number (0 to 100 representing your assessment confidence),
  "reasons": string[] (detailed explanations of why you categorized it this way),
  "recommendation": string (specific actionable recommended guidance for the user),
  "redFlags": string[] (specific alert markers found, e.g., "Urgent threat language", "Mismatched domain", "OTP request")
}

Analyze carefully for lottery scams, bank impersonations, OTP requests, UPI scams, fake QR details, cryptocurrency investments, fake jobs, romance scam indicators, parcel courier tricks, urgency language, threat terms, and typosquatting.
`;

/**
 * Perform AI analysis on a text input using available AI clients.
 */
export const analyzeContent = async (
  content: string,
  inputType: 'text' | 'url' | 'image' | 'pdf' | 'audio'
): Promise<AIAnalysisResult> => {
  logger.info(`Analyzing content of type: ${inputType} (length: ${content.length})`);

  // Try Gemini client first
  if (geminiClient) {
    try {
      logger.info('Running analysis via Gemini...');
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nInput to analyze:\n${content}` }] },
        ],
      });

      const text = response.text || '';
      return parseAIResponse(text);
    } catch (error) {
      logger.error('Gemini analysis failed, trying OpenAI if configured...', error);
    }
  }

  // Try OpenAI client next
  if (openaiClient) {
    try {
      logger.info('Running analysis via OpenAI...');
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '';
      return parseAIResponse(text);
    } catch (error) {
      logger.error('OpenAI analysis failed:', error);
    }
  }

  // Fallback / Mockup parser for testing when API keys are not supplied or fail
  logger.warn('No active AI keys or API calls failed. Falling back to local heuristic scan engine.');
  return runHeuristicScan(content, inputType);
};

/**
 * Clean and parse AI JSON responses
 */
const parseAIResponse = (text: string): AIAnalysisResult => {
  let cleaned = text.trim();
  // Strip markdown fences if AI returns them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    // Ensure all fields exist
    return {
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
      category: ['Safe', 'Suspicious', 'Fraud', 'High Risk Scam', 'Critical'].includes(parsed.category)
        ? parsed.category
        : 'Suspicious',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 70,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ['Analyzed by AI scanner.'],
      recommendation: parsed.recommendation || 'Exercise caution before proceeding.',
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    };
  } catch (err) {
    logger.error('Failed to parse AI JSON response. Raw text was:', text);
    throw new Error('AI service returned invalid JSON formatting');
  }
};

/**
 * Local heuristic scan engine used as fallback
 */
const runHeuristicScan = (content: string, type: string): AIAnalysisResult => {
  const normalized = content.toLowerCase();
  const redFlags: string[] = [];
  const reasons: string[] = [];
  let riskScore = 0;

  // Text heuristics
  if (normalized.includes('otp') || normalized.includes('one time password') || normalized.includes('one-time password')) {
    riskScore += 45;
    redFlags.push('Request for OTP / One-Time Password');
    reasons.push('The content requests a One-Time Password, which is a common vector for unauthorized account access.');
  }

  if (normalized.includes('lottery') || normalized.includes('crore') || normalized.includes('won') || normalized.includes('prize')) {
    riskScore += 35;
    redFlags.push('Lottery or Unsolicited Prize Claim');
    reasons.push('Claims of winning a lottery or cash prizes without participation are highly indicative of advance-fee fraud.');
  }

  if (normalized.includes('urgent') || normalized.includes('immediately') || normalized.includes('within 24 hours') || normalized.includes('blocked') || normalized.includes('suspended')) {
    riskScore += 25;
    redFlags.push('Urgency and Threat Inducing Language');
    reasons.push('Creating artificial urgency or threatening account suspension forces quick action without verifying authenticity.');
  }

  if (normalized.includes('bank') || normalized.includes('kyc') || normalized.includes('pan card') || normalized.includes('update kyc')) {
    riskScore += 30;
    redFlags.push('KYC or Banking Verification Request');
    reasons.push('Requests to update bank cards or KYC information via SMS or link are standard bank phishing tactics.');
  }

  if (normalized.includes('bitcoin') || normalized.includes('investment') || normalized.includes('crypto') || normalized.includes('double your')) {
    riskScore += 30;
    redFlags.push('High-yield cryptocurrency or investment offer');
    reasons.push('Guaranteed high returns or cryptocurrency investment advice are common financial scam flags.');
  }

  // URL heuristics
  if (type === 'url') {
    if (normalized.includes('bit.ly') || normalized.includes('tinyurl') || normalized.includes('t.co')) {
      riskScore += 20;
      redFlags.push('URL Shortener detected');
      reasons.push('Shortened links mask the actual destination address, frequently used in SMS/WhatsApp phishing.');
    }
    if (normalized.includes('secure') && normalized.includes('login') && !normalized.startsWith('https://')) {
      riskScore += 35;
      redFlags.push('Suspicious unencrypted login interface');
      reasons.push('URL requests login information over plain HTTP, indicating a mock phishing gateway.');
    }
    if (normalized.includes('verify') || normalized.includes('update-profile') || normalized.includes('account-support')) {
      riskScore += 15;
      redFlags.push('Phishing-oriented keywords in path');
      reasons.push('Keywords related to verification or account review are standard elements of credential theft sites.');
    }
  }

  // Final score logic
  riskScore = Math.min(riskScore, 100);
  let category: 'Safe' | 'Suspicious' | 'Fraud' | 'High Risk Scam' = 'Safe';
  let confidence = 85;

  if (riskScore >= 75) {
    category = 'High Risk Scam';
    confidence = 90;
  } else if (riskScore >= 40) {
    category = 'Fraud';
    confidence = 80;
  } else if (riskScore >= 15) {
    category = 'Suspicious';
    confidence = 75;
  }

  if (reasons.length === 0) {
    reasons.push('No obvious digital threat signatures, keyword anomalies, or urgent demands were found.');
  }

  return {
    riskScore,
    category,
    confidence,
    reasons,
    recommendation: riskScore >= 40 
      ? 'Do not interact with this content, click any links, or input credentials. Verify with the sender via official, off-channel communication.'
      : riskScore >= 15
      ? 'Proceed with caution. Double check sender email addresses and avoid clicking untrusted links.'
      : 'This content appears relatively safe. Always stay vigilant when communicating online.',
    redFlags,
  };
};
