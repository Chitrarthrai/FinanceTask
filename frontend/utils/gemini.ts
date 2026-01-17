import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Missing VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface ParsedReceipt {
  merchantName?: string;
  amount?: number;
  date?: string;
  category?: string;
  type?: "income" | "expense";
}

export const parseReceiptImage = async (file: File): Promise<ParsedReceipt> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please check your settings.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Convert file to base64
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analyze this receipt or transaction slip image and extract value in JSON format:
      - merchantName: The name of the store, merchant, bank, or sender.
      - amount: The total amount (number).
      - date: The date (string, ISO format).
      - category: Best fit from [Food, Shopping, Housing, Transport, Utilities, Entertainment, Salary, Freelance, Income, Others].
      - type: "income" (for deposits, salary, credit) or "expense" (for purchases, payments).
      
      If it is a Deposit Slip, 'type' should be 'income' and 'merchantName' should be the Bank or Sender.
      
      Return ONLY raw JSON.
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText) as ParsedReceipt;
  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw new Error("Failed to analyze receipt. Please try again.");
  }
};

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: (await base64EncodedDataPromise) as string,
      mimeType: file.type,
    },
  };
}
