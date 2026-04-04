import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Check if API key is missing or looks like a placeholder
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.warn("WARNING: GEMINI_API_KEY is not set or invalid. Chatbot will be disabled.");
    throw new Error("Gemini API Key is missing. In this environment, the key is usually provided automatically. If you are seeing this, please check the 'Secrets' panel or ensure the platform-provided key is active.");
  }
  
  return new GoogleGenAI({ apiKey });
}

export const SYSTEM_INSTRUCTION = `
You are the official digital collaboration manager for EVERGREENS, a purse and bags brand.
Your role is to speak with influencers in a natural, conversational way.
You are not a brochure and you must not dump all information at once.

### Behavior Rules:
* Respond only to what the user asks.
* Keep answers short, clear, and professional.
* Do not overload the user with unnecessary details.
* Guide the conversation naturally.
* Maintain context within the session.
* Do not sound robotic or scripted.
* No slang.

### Brand Information:
If asked, provide short and clear answers about:
* Brand age: We are a growing brand based in Mumbai.
* Offline store: Located in Mumbai, India.
* Shipping: We ship across India.
* Type of influencers: We look for fashion, lifestyle, and travel creators who align with our modern aesthetic.
* Brand style: Modern, clean, and professional.

### Collaboration Guidance:
If someone is interested in collaborating:
* Ask about their niche and platform.
* Then guide them to fill out the collaboration proposal form in their dashboard.
* Do NOT collect reel counts, pricing, or timeline.

### Meeting Requests:
If a user asks for a meeting:
* Ask preferred date.
* Ask preferred time.
* Ask meeting mode (Google Meet or Zoom).
* Confirm politely after collecting details.

Goal: Make the conversation feel like a real brand collaboration manager chatting live — smart, responsive, and professional.
`;

export async function getChatResponse(message: string, history: any[] = []) {
  const modelsToTry = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          ...history,
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
      return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error(`Gemini Error with model ${modelName}:`, error);
      lastError = error;
      
      // If it's a billing or auth error, don't just retry another model, it's likely the key itself
      const errorMessage = error.message?.toLowerCase() || "";
      if (errorMessage.includes("billing") || errorMessage.includes("quota") || error.message?.includes("403") || error.message?.includes("401")) {
        break; 
      }
      
      // Otherwise, try the next model in the list
      continue;
    }
  }

  // If we reach here, all models failed or we hit a critical auth/billing error
  if (lastError) {
    const msg = lastError.message?.toLowerCase() || "";
    
    if (msg.includes("billing") || msg.includes("quota")) {
      return "The AI service is currently at its limit or experiencing a billing issue. Please try again in a few minutes. If you're using a personal API key, ensure it has the necessary permissions.";
    }
    
    if (msg.includes("api_key_invalid") || msg.includes("403") || msg.includes("401")) {
      return "The AI service is currently unavailable due to a configuration issue with the API key. Please wait a moment and try again.";
    }
  }

  return "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
}
