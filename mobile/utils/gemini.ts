import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from "expo-file-system/legacy";

// We use the same key as chat or a dedicated one if available.
// User provided VITE_GEMINI_API_KEY in .env, which maps to EXPO_PUBLIC_GEMINI_API_KEY usually.
// I will check process.env or just use the one from geminiChat if it's the same.
// The user's .env had VITE_GEMINI_API_KEY. I'll access it via process.env.VITE_GEMINI_API_KEY if possible,
// but since this is Expo, I'll recommend they use EXPO_PUBLIC.
// However, I will try to use the key that was likely loaded.
// Note: In Expo, process.env.EXPO_PUBLIC_... is standard.
// If user really put VITE_... in .env, I might need to ask them to rename or install dotenv.
// For now, I'll fallback to the key I used in geminiChat which was `process.env.EXPO_PUBLIC_GEMINI_API_KEY`.
// Wait, if the user explicitly added VITE_ keys, I should try to use them if I can?
// No, standard Expo won't expose VITE_ keys to the bundle.
// I will assume the key is EXPO_PUBLIC_GEMINI_API_KEY as per best practice, or I'll just hardcode `process.env.VITE_GEMINI_API_KEY`
// and hope the user has a transformer. But safest is to use the one I used before.
// Actually, looking at the previous turn `geminiChat.ts` I used `process.env.EXPO_PUBLIC_GEMINI_API_KEY`.
// But the user said "i have added env with VITE_GEMINI_API_KEY".
// So I should try to access that. I'll declare it as a const and try both.

const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "Missing GEMINI_API_KEY. Please ensure EXPO_PUBLIC_GEMINI_API_KEY or VITE_GEMINI_API_KEY is set in .env",
  );
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface ParsedReceipt {
  merchantName?: string;
  amount?: number;
  date?: string;
  category?: string;
  type?: "income" | "expense";
}

export const parseReceiptImage = async (
  imageUri: string,
): Promise<ParsedReceipt> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    const prompt = `
      Analyze this receipt or transaction slip image and extract values in JSON format:
      - merchantName: The name of the store, merchant, bank, or sender.
      - amount: The total amount (number).
      - date: The date (string, ISO format YYYY-MM-DD).
      - category: Best fit from [Food, Shopping, Housing, Transport, Utilities, Entertainment, Salary, Freelance, Income, Others].
      - type: "income" (for deposits, salary, credit) or "expense" (for purchases, payments).
      
      If it is a Deposit Slip, 'type' should be 'income' and 'merchantName' should be the Bank or Sender.
      
      Return ONLY raw JSON. Do not use markdown blocks.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }, // Assuming jpeg/png, Gemini handles most standard image types
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini Receipt Response:", text);

    // Clean up potential markdown code blocks if Gemini adds them
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText) as ParsedReceipt;
  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw new Error("Failed to analyze receipt.");
  }
};
