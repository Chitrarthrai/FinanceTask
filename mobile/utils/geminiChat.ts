import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";

const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_CHAT_API_KEY ||
  process.env.VITE_GEMINI_CHAT_API_KEY ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Missing EXPO_PUBLIC_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const toolsDef: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "addTransaction",
        description:
          "Add a new financial transaction (expense or income) to the database.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "The description of the transaction.",
            },
            amount: {
              type: SchemaType.NUMBER,
              description: "The amount of the transaction.",
            },
            category: {
              type: SchemaType.STRING,
              description: "The category (Food, Transport, etc).",
            },
            type: {
              type: SchemaType.STRING,
              format: "enum",
              enum: ["expense", "income"],
              description: "Whether it is an 'expense' or 'income'.",
            },
            date: {
              type: SchemaType.STRING,
              description: "The date in YYYY-MM-DD format.",
            },
          },
          required: ["title", "amount", "category", "type"],
        },
      },
      {
        name: "createTask",
        description: "Create a new financial task or reminder.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description:
                "The title of the task (e.g., 'Pay Rent', 'Check Budget').",
            },
            amount: {
              type: SchemaType.NUMBER,
              description: "The amount associated with the task, if any.",
            },
            dueDate: {
              type: SchemaType.STRING,
              description: "The due date in YYYY-MM-DD format.",
            },
            priority: {
              type: SchemaType.STRING,
              format: "enum",
              enum: ["low", "medium", "high"],
              description: "The priority of the task.",
            },
          },
          required: ["title"],
        },
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: toolsDef,
});

export interface ChatMessage {
  _id: string; // Added for GiftedChat
  text: string;
  createdAt: Date;
  user: {
    _id: number;
    name: string;
    avatar?: string;
  };
  // Custom fields for function calling handling
  role?: "user" | "model" | "function";
  functionCall?: any;
  functionResponse?: any;
  system?: boolean;
}

export const chatWithGemini = async (
  history: ChatMessage[],
  newMessage: string,
  context: string,
  functionResult?: { name: string; response: any },
): Promise<{ text?: string; functionCall?: any }> => {
  if (!API_KEY) return { text: "API Key missing." };

  try {
    // Map GiftedChat history to Gemini history
    // Simplifying to just context + last few messages for now to avoid complexity with GiftedChat format
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: `SYSTEM_CONTEXT: ${context}` }],
      },
      {
        role: "model",
        parts: [
          { text: "Understood. I am ready to act as your financial advisor." },
        ],
      },
    ];

    // Push recent history (reversed back to normal order)
    // This is a naive history reconstruction. For robust history, we need to store raw Gemini messages alongside GiftedChat messages.
    // For now, simpler is better for "one-shot" interactions or short context.

    const chat = model.startChat({
      history: chatHistory as any,
    });

    let result;
    if (functionResult) {
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: functionResult.name,
            response: functionResult.response,
          },
        },
      ]);
    } else {
      result = await chat.sendMessage(newMessage);
    }

    const response = await result.response;
    const functionCalls = response.functionCalls();
    const text = response.text();

    if (functionCalls && functionCalls.length > 0) {
      return { functionCall: functionCalls[0] };
    }

    return { text };
  } catch (e) {
    console.error(e);
    return { text: "Sorry, I had trouble processing that." };
  }
};
