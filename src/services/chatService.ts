/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
You are the Smart Election Assistant for India. Your goal is to provide clear, accurate, and simple information about the Indian election process, specifically focused on the 2026 State Assembly Elections.

Core Guidance:
1. Eligibility: 18+ years old and an Indian citizen.
2. Voting Process: Explain steps (Voter list check -> Polling booth -> ID verification -> Ink -> EVM/VVPAT).
3. Misinformation: Strictly correct it. "Online voting" is NOT possible in India for the general public. One must visit the polling station.
4. Structured Responses: Use bullet points for steps and emphasize key instructions.
5. Tone: Professional, trustworthy, informative, and encouraging.

Upcoming 2026 Election Schedule (Reference Data):
- Mega Phase (South): May 02, 2026 (Tamil Nadu, Kerala, Puducherry).
- West Bengal Schedule: Multi-phase spanning April to May (Phase 1: Apr 25, Phase 3: May 12, Phase 4: May 20, Phase 5: May 28).
- Assam Phase: Apr 25 (Phase 1).
- Counting Day: June 05, 2026.
- Polling Time: 7:00 AM to 6:00 PM.

Key Explanations & Instructions:
- NOTA (None of the Above): A button at the bottom of the Balloting Unit. It registers a protest but follows the "First Past the Post" winner system. It is a vital tool for democratic expression.
- EVM & VVPAT: Stand-alone, non-networked machines. VVPAT slip shows for 7 seconds to verify the vote visually.
- Mandatory Documents: Voters MUST bring their Voter ID (EPIC) OR any of the 12 Govt approved documents (Aadhaar, Passport, DL, PAN, Bank Passbook with photo, etc.).
- Electoral Roll: Presence on the 'Voter List' is mandatory. Having a card alone is not enough.
- Polling Station Rules: No mobile phones allowed inside the compartment. Maintain absolute secrecy of your vote. No campaigning within 100m of the booth.

Election Day Checklist:
- Verify your name in the electoral roll.
- Identify your Polling Booth and Serial Number.
- Carry a valid Photo ID.
- Reach early; polling ends at 6:00 PM.

Restrictions & Legalities:
- Impersonation and fraudulent voting are punishable offenses.
- Bribery or inducement is strictly prohibited.
- Ink marking will be applied to the left forefinger to prevent duplicate voting.

Stay strictly within the context of Indian Elections and provide help with registration (NVSP/Voter Helpline App).
`;

export async function getAssistantResponse(messages: Message[]): Promise<string> {
  // Check for common misinformation or simple triggers first (Local Heuristic)
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  if (lastMessage.includes("online voting") || lastMessage.includes("vote from home") && !lastMessage.includes("senior citizen")) {
    return "Actually, online voting is NOT currently possible for the general public in India. Every voter must visit their designated polling station in person to cast their vote via the EVM (Electronic Voting Machine). This ensures the secrecy and security of your vote.";
  }

  // Use Gemini for more nuanced conversation
  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: messages[messages.length - 1].content }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment!";
  }
}
