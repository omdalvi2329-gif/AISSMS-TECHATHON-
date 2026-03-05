/**
 * geminiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * KrishiMitra AI — Google Gemini Integration Service
 *
 * Handles:
 *  • SDK initialisation with API key validation
 *  • Agriculture-aware system prompt construction
 *  • Multi-turn conversation history management
 *  • Streaming (SSE) text generation for real-time responses
 *  • Multimodal requests (text + crop image)
 *  • Graceful error handling and fallback messages
 *
 * Model: gemini-2.0-flash  (fast, cost-efficient, multimodal)
 * Docs : https://ai.google.dev/api/generate-content
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ─── Model Configuration ────────────────────────────────────────────────────

/**
 * Primary model — gemini-1.5-flash-latest
 * Using -latest alias ensures we hit the most stable version of 1.5-flash.
 */
const MODEL_NAME = 'gemini-1.5-flash-latest';
const FALLBACK_MODEL = 'gemini-1.5-flash';

// ─── Safety Settings ─────────────────────────────────────────────────────────
// Configured to be permissive for agricultural/scientific advice.
const SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

// ─── Generation Configuration ────────────────────────────────────────────────
const GENERATION_CONFIG = {
    temperature: 0.8,        // Balanced creativity vs. accuracy for agricultural advice
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,   // Enough for detailed farming advice
};

// ─── System Prompt Builder ───────────────────────────────────────────────────

/**
 * Builds a rich, agriculture-specific system instruction for KrishiMitra AI.
 * Dynamically incorporates current farm context for personalised responses.
 *
 * @param {Object} farmContext - { location, crop, stage, soil, size }
 * @param {string} language    - e.g. 'en', 'hi', 'mr'
 * @returns {string} System instruction string
 */
export const buildSystemPrompt = (farmContext = {}, language = 'en') => {
    const {
        location = 'India',
        crop = 'Mixed crops',
        stage = 'Growing',
        soil = 'Mixed',
        size = 'Unknown',
    } = farmContext;

    const langInstruction =
        language === 'hi'
            ? 'Respond in Hindi (Devanagari script) when not in English mode.'
            : language === 'mr'
                ? 'Respond in Marathi (Devanagari script) when not in English mode.'
                : 'Respond in clear, simple English.';

    return `You are KrishiMitra AI, an expert agricultural assistant built into the AgriSetu platform for Indian farmers.

## Your Identity
- Name: KrishiMitra AI (कृषि मित्र — "Friend of Agriculture")
- Role: Trusted agricultural advisor and crop specialist
- Persona: Knowledgeable yet approachable, like a friendly agronomist

## Current Farm Context (use this for personalised advice)
- 📍 Location: ${location}
- 🌾 Primary Crop: ${crop}
- 🌱 Growth Stage: ${stage}
- 🪨 Soil Type: ${soil} soil
- 📐 Farm Size: ${size} acres

## Your Core Capabilities
1. **Crop Disease Diagnosis** — Identify diseases from text descriptions or uploaded images
2. **Pest Management** — Recommend IPM (Integrated Pest Management) strategies
3. **Irrigation Advice** — Based on crop stage, soil, and weather conditions
4. **Fertilizer Planning** — Nutrient schedules tailored to crop and soil
5. **Market Insights** — General price trends and best selling windows
6. **Weather-Based Alerts** — Actionable advice based on forecast data
7. **Seasonal Calendar** — Sowing, pruning, harvesting timelines

## Response Guidelines
- Always be specific to the farm context above (${location}, ${crop}, ${stage} stage)
- Use ✅ for recommendations, ⚠️ for warnings, 💡 for tips, 🚨 for urgent alerts
- Keep responses concise but complete (avoid very long paragraphs)
- When diagnosing from an image, describe what you see, then diagnose, then advise
- Include specific quantities (e.g., "apply 2kg/acre of urea") where applicable
- If unsure, say so and suggest consulting a local agronomist
- ${langInstruction}

## Important Constraints
- Focus only on agriculture, farming, weather, and rural livelihood topics
- Do NOT provide medical or legal advice
- Always prioritise farmer safety and eco-friendly practices`;
};

// ─── Gemini Client Initialisation ────────────────────────────────────────────

let genAI = null;
let chatModel = null;
let visionModel = null;

/**
 * Initialises the Google Generative AI client.
 * Called lazily on first use.
 *
 * @param {string} apiKey - Gemini API key from environment or user input
 * @returns {{ success: boolean, error?: string }}
 */
export const initGemini = (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
        return { success: false, error: 'API key is missing or empty.' };
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey.trim());

        // Text-only chat model
        chatModel = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS,
        });

        // Vision model (same model, Gemini 2.0 Flash handles multimodal natively)
        visionModel = chatModel;

        console.log(`✅ KrishiMitra AI: Gemini SDK initialised with model "${MODEL_NAME}"`);
        return { success: true };
    } catch (err) {
        console.error('❌ KrishiMitra AI: Gemini SDK init failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Returns true if Gemini has been successfully initialised.
 */
export const isGeminiReady = () => genAI !== null && chatModel !== null;

// ─── Conversation History Manager ────────────────────────────────────────────

/**
 * Transforms our internal chatHistory state into the format
 * required by the Gemini multi-turn Chat API.
 *
 * Internal format:  { sender: 'user'|'ai', text: '...' }
 * Gemini format:    { role: 'user'|'model', parts: [{ text: '...' }] }
 *
 * @param {Array} chatHistory - Internal chat history array
 * @param {number} maxMessages - Max messages to include (avoids token overflow)
 * @returns {Array} Gemini-compatible history array
 */
export const buildGeminiHistory = (chatHistory, maxMessages = 20) => {
    // Take the last N messages, exclude the initial AI greeting (index 0)
    const recentHistory = chatHistory.slice(1).slice(-maxMessages);

    return recentHistory
        .filter((msg) => msg.text && msg.sender !== 'system') // skip empty/system messages
        .map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
};

// ─── Core API Functions ───────────────────────────────────────────────────────

/**
 * Sends a text message to Gemini and returns the full response.
 * Uses the standard (non-streaming) generateContent endpoint.
 *
 * @param {string} userMessage - The user's message
 * @param {Array}  chatHistory - Previous chat messages for context
 * @param {Object} farmContext - Current farm context for system prompt
 * @param {string} language    - Language code
 * @returns {Promise<{ text: string, usage: Object|null }>}
 */
export const sendMessageToGemini = async (
    userMessage,
    chatHistory = [],
    farmContext = {},
    language = 'en'
) => {
    if (!isGeminiReady()) {
        throw new Error('Gemini SDK is not initialised. Please provide a valid API key.');
    }

    const systemInstruction = buildSystemPrompt(farmContext, language);
    const history = buildGeminiHistory(chatHistory);

    // Create a fresh chat session with conversation history
    const chat = chatModel.startChat({
        history,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: GENERATION_CONFIG,
        safetySettings: SAFETY_SETTINGS,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    const text =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.text?.() ||
        'Sorry, I could not generate a response. Please try again.';

    const usage = response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            responseTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
        }
        : null;

    return { text, usage };
};

/**
 * Sends a message to Gemini with STREAMING enabled.
 * Calls onChunk(text) for each streamed chunk — ideal for real-time chatbot UX.
 *
 * @param {string}   userMessage - The user's message
 * @param {Array}    chatHistory - Previous chat messages for context
 * @param {Object}   farmContext - Current farm context
 * @param {string}   language    - Language code
 * @param {Function} onChunk     - Callback invoked with each text chunk: (chunkText: string) => void
 * @param {Function} onDone      - Callback invoked when streaming is complete: (fullText: string, usage: Object) => void
 * @param {Function} onError     - Callback invoked on error: (error: Error) => void
 */
export const streamMessageToGemini = async (
    userMessage,
    chatHistory = [],
    farmContext = {},
    language = 'en',
    onChunk,
    onDone,
    onError
) => {
    if (!isGeminiReady()) {
        onError?.(new Error('Gemini SDK is not initialised. Please provide a valid API key.'));
        return;
    }

    try {
        const systemInstruction = buildSystemPrompt(farmContext, language);
        const history = buildGeminiHistory(chatHistory);

        const chat = chatModel.startChat({
            history,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS,
        });

        const streamResult = await chat.sendMessageStream(userMessage);

        let fullText = '';
        let usage = null;

        for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                fullText += chunkText;
                onChunk?.(chunkText);
            }
        }

        // Get final response metadata after stream completes
        const finalResponse = await streamResult.response;
        if (finalResponse.usageMetadata) {
            usage = {
                promptTokens: finalResponse.usageMetadata.promptTokenCount,
                responseTokens: finalResponse.usageMetadata.candidatesTokenCount,
                totalTokens: finalResponse.usageMetadata.totalTokenCount,
            };
        }

        onDone?.(fullText, usage);
    } catch (err) {
        console.error('❌ KrishiMitra AI: Streaming error:', err);
        onError?.(err);
    }
};

/**
 * Sends a multimodal request (text + image) to Gemini Vision.
 * Crop image analysis for disease detection, pest ID, etc.
 *
 * @param {string} userMessage  - Text description or question
 * @param {string} imageBase64  - Base64 image string (with or without data URI prefix)
 * @param {string} mimeType     - e.g. 'image/jpeg', 'image/png', 'image/webp'
 * @param {Object} farmContext  - Current farm context
 * @param {string} language     - Language code
 * @returns {Promise<{ text: string, usage: Object|null }>}
 */
export const analyzeImageWithGemini = async (
    userMessage,
    imageBase64,
    mimeType = 'image/jpeg',
    farmContext = {},
    language = 'en'
) => {
    if (!isGeminiReady()) {
        throw new Error('Gemini SDK is not initialised. Please provide a valid API key.');
    }

    const systemInstruction = buildSystemPrompt(farmContext, language);

    // Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    const base64Data = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

    const prompt = `${systemInstruction}\n\n---\n\nUser says: "${userMessage || 'Please analyze this crop image and provide detailed advice.'}"\n\nPlease:\n1. Describe what you observe in the image\n2. Identify any diseases, pests, or stress symptoms\n3. Provide actionable treatment recommendations\n4. Estimate urgency level (Low/Medium/High/Critical)`;

    const imagePart = {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response;

    const text =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.text?.() ||
        'Sorry, I could not analyze this image. Please try again.';

    const usage = response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            responseTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
        }
        : null;

    return { text, usage };
};

/**
 * Validates the API key by making a lightweight test request.
 * Returns { valid: true } or { valid: false, error: string }.
 *
 * @param {string} apiKey - The API key to test
 * @returns {Promise<{ valid: boolean, error?: string, model?: string }>}
 */
export const validateGeminiApiKey = async (apiKey) => {
    const initResult = initGemini(apiKey);
    if (!initResult.success) {
        return { valid: false, error: initResult.error };
    }

    try {
        const testModel = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await testModel.generateContent('Say "API key verified" in 3 words.');
        const text = result.response.text();
        console.log('✅ Gemini API Key validated. Test response:', text);
        return { valid: true, model: MODEL_NAME };
    } catch (err) {
        // Try fallback model
        try {
            const fallbackTestModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
            await fallbackTestModel.generateContent('Hi');
            console.warn(`⚠️ Primary model unavailable, using fallback: ${FALLBACK_MODEL}`);
            chatModel = fallbackTestModel;
            visionModel = fallbackTestModel;
            return { valid: true, model: FALLBACK_MODEL };
        } catch (fallbackErr) {
            genAI = null;
            chatModel = null;
            visionModel = null;
            return {
                valid: false,
                error: err.message?.includes('API_KEY_INVALID')
                    ? 'Invalid API key. Please check your Gemini API key.'
                    : err.message || 'API key validation failed.',
            };
        }
    }
};

// ─── REST API Fallback (no SDK) ───────────────────────────────────────────────

/**
 * Direct REST API call to Gemini — used as fallback if SDK fails.
 * Endpoint: POST /v1beta/models/gemini-2.0-flash:generateContent
 *
 * @param {string} apiKey       - Gemini API key
 * @param {string} userMessage  - Text message
 * @param {string|null} imageBase64 - Optional base64 image
 * @param {Object} farmContext  - Farm context
 * @param {string} language     - Language
 * @returns {Promise<{ text: string, usage: Object|null }>}
 */
export const sendViaRestApi = async (
    apiKey,
    userMessage,
    imageBase64 = null,
    farmContext = {},
    language = 'en',
    modelOverride = null
) => {
    const systemInstruction = buildSystemPrompt(farmContext, language);
    const targetModel = modelOverride || MODEL_NAME;
    // Use v1 for stable flash models to avoid v1beta 404s
    const apiVersion = targetModel.includes('2.0') ? 'v1beta' : 'v1';
    const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${targetModel}:generateContent?key=${apiKey}`;

    const textPart = {
        text: `${systemInstruction}\n\n---\n\nUser: ${userMessage || 'Analyze the image.'}`,
    };

    const parts = [textPart];

    if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
            inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
            },
        });
    }

    const requestBody = {
        contents: [{ role: 'user', parts }],
        generationConfig: GENERATION_CONFIG,
        safetySettings: SAFETY_SETTINGS.map((s) => ({
            category: s.category,
            threshold: s.threshold,
        })),
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
            errData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || 'Gemini API returned an error.');
    }

    const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, no response was generated.';

    const usage = data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            responseTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
        }
        : null;

    return { text, usage };
};

// ─── Export Default Config ────────────────────────────────────────────────────
export default {
    initGemini,
    isGeminiReady,
    buildSystemPrompt,
    buildGeminiHistory,
    sendMessageToGemini,
    streamMessageToGemini,
    analyzeImageWithGemini,
    validateGeminiApiKey,
    sendViaRestApi,
    MODEL_NAME,
    FALLBACK_MODEL,
};
