export interface InterviewQuestion {
  question: string;
  // Explains which competency or signal this question evaluates
  intent: string;
}

// Returned by Gemini when the input isn't a recognisable job title
interface GeminiErrorPayload {
  error: string;
}

interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from a string.
 * This ensures we get clean JSON text that is ready to be parsed.
 */
function extractJson(rawText: string): string {
  return rawText
    .replace(/^```(?:json)?\s*/i, '') // Remove opening fence
    .replace(/\s*```$/, '')           // Remove closing fence
    .trim();
}

/**
 * Calls the Gemini API to generate exactly 3 targeted interview questions.
 */
export async function fetchInterviewQuestions(
  jobTitle: string
): Promise<InterviewQuestion[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  if (!apiKey) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY. Please check your environment variables.'
    );
  }

  // We use gemini-2.5-flash as our LLM provider for its exceptional speed and quality.
  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // System instruction sets the persona so the output is high-signal and structured
  const systemInstruction = {
    parts: [
      {
        text: 'You are a senior recruiter at an HRTech company. You design role-specific, competency-based interview questions that probe core skills and real-world scenarios, avoiding generic behavioral questions. If the input you receive is not a recognisable job title or professional role, you must return a JSON error object instead of questions.',
      },
    ],
  };

  // Detailed prompt instructing the model to output a specific JSON structure.
  // The guard clause at the top is the prompt-level guardrail: it tells Gemini
  // to return a typed error rather than hallucinating questions for nonsense input.
  const userPrompt = `First, decide whether "${jobTitle}" is a recognisable job title or professional role.

If it is NOT a real job title (e.g. it is a random word, a colour, a place name, or gibberish), return ONLY this JSON object and nothing else:
{ "error": "That doesn't look like a job title. Try something like 'Product Manager' or 'Data Analyst'." }

If it IS a valid job title, generate exactly 3 interview questions for a "${jobTitle}" role.

Each question must:
1. Target a specific competency or skill critical for a "${jobTitle}"
2. Invite concrete, evidence-based responses from the candidate
3. Reveal how the candidate thinks and solves problems

Return ONLY a JSON array of objects. Do not wrap it in markdown code fences or add explanations.
Each object must have exactly two fields:
- "question": the actual interview question (string)
- "intent": a one-sentence explanation of what signal or competency this question evaluates (string)

Example JSON:
[
  {
    "question": "How do you...",
    "intent": "Evaluates their ability to..."
  }
]`;

  const requestBody = {
    system_instruction: systemInstruction,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.7, // Balances creativity with strict adherence to instructions
      responseMimeType: 'application/json', // Requests structured JSON output directly
    },
  };

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data: GeminiResponse = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleanedJson = extractJson(rawText);

  let parsed: InterviewQuestion[] | GeminiErrorPayload;
  try {
    parsed = JSON.parse(cleanedJson);
  } catch {
    throw new Error('Failed to parse the API response as valid JSON.');
  }

  // Prompt-level guardrail: Gemini signals that the input isn't a real job title
  if (!Array.isArray(parsed) && typeof parsed === 'object' && 'error' in parsed) {
    throw new Error((parsed as GeminiErrorPayload).error);
  }

  const questions = parsed as InterviewQuestion[];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Unexpected response format from the AI model.');
  }

  return questions;
}
