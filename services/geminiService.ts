
import { GoogleGenAI, Type } from "@google/genai";
import { ParseResult } from "../types";

export const parseEmailContent = async (text: string): Promise<ParseResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract all contact information from the following email text. For each person found, provide their full name, email address, professional title, and phone number if available. If a field is missing, use an empty string. Only return valid contacts found in the text.
    
    IMPORTANT FORMATTING RULES:
    1. Name Parsing: Ensure all names are strictly Title Cased (e.g. "John Doe", "Maria Garcia"). Capitalize ONLY the first letter of each name part. Do NOT use ALL CAPS.
    2. Greek Names: Pay special attention to Greek names. Ensure they are Title Cased and maintain their correct accents (e.g. "Γιώργος" not "ΓΙΩΡΓΟΣ" or "Γιωργος").

    Email Content:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contacts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Full name of the person" },
                email: { type: Type.STRING, description: "Email address" },
                title: { type: Type.STRING, description: "Job title or role" },
                phone: { type: Type.STRING, description: "Phone number" }
              },
              required: ["name", "email", "title", "phone"]
            }
          }
        },
        required: ["contacts"]
      }
    }
  });

  const jsonStr = response.text.trim();
  try {
    return JSON.parse(jsonStr) as ParseResult;
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini", error);
    return { contacts: [] };
  }
};
