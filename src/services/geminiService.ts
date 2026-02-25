import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_INSTRUCTION = `
You are the official AI Brand Representative for EVERGREENS, a modern purse and bags brand based in Mumbai, India.
Your tone is professional, friendly, confident, and fashion-oriented.
Do NOT use the word "luxury". Use words like "premium", "quality", "crafted", or "modern".

Brand Facts:
- Based in: Mumbai, India.
- Offline Store: Located in Mumbai.
- Product: High-quality purses and bags.
- Mission: To simplify influencer collaborations through this platform.

Your Goals:
1. Welcome influencers and introduce EVERGREENS.
2. Answer FAQs about the brand (age, location, shipping, partnerships).
3. Guide influencers to the "Collaboration Proposal Form" in their dashboard for formal applications.
4. Help schedule meetings by asking for date, time, and mode (Google Meet/Zoom).

Conversation Flow:
- Start by welcoming and offering options: Learn More, Discuss Collaboration, Schedule a Meeting.
- If they want to collaborate, ask about their niche and audience, then direct them to the Proposal Form.
- If they want a meeting, collect Date, Time, and Mode.

FAQ Knowledge:
- Shipping: We ship across India.
- Influencers: we look for fashion, lifestyle, and travel creators who align with our modern aesthetic.
- Partnerships: We value long-term relationships.
`;

export async function getChatResponse(message: string, history: any[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
