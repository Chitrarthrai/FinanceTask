import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_CHAT_API_KEY;

if (!API_KEY) {
  console.warn("Missing VITE_GEMINI_CHAT_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// --- 1. TOOL DEFINITIONS ---
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
              description:
                "The description of the transaction (e.g., 'Coffee', 'Salary').",
            },
            amount: {
              type: SchemaType.NUMBER,
              description: "The amount of the transaction.",
            },
            category: {
              type: SchemaType.STRING,
              description:
                "The category of the transaction (e.g., 'Food', 'Transport', 'Salary').",
            },
            type: {
              type: SchemaType.STRING,
              format: "enum",
              enum: ["expense", "income"],
              description: "Whether it is an 'expense' or 'income'.",
            },
            date: {
              type: SchemaType.STRING,
              description:
                "The date of the transaction in YYYY-MM-DD format. Defaults to today if not specified.",
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

// Initialize model with tools
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: toolsDef,
});

export interface ChatMessage {
  role: "user" | "model" | "function";
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

export interface ChatResponse {
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
}

export const chatWithGemini = async (
  history: ChatMessage[],
  newMessage: string | null,
  context: string,
  functionResponse?: { name: string; response: any },
): Promise<ChatResponse> => {
  if (!API_KEY) {
    return {
      text: "Error: I am missing my API Key. Please check your settings.",
    };
  }

  try {
    // Construct history for Gemini SDK
    // Note: The SDK manages history statefully in `startChat`, but since we are
    // re-creating the chat session each time (stateless wrapper), we must replay history.
    // For proper tool use, we need to be careful with turn order.

    // Simplification: We will just start a new chat with the *entire* history every time.
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: `SYSTEM_CONTEXT: ${context}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am ready to act as your financial advisor using this data and my tools.",
          },
        ],
      },
      ...history.map((msg) => {
        if (msg.role === "model" && msg.functionCall) {
          return {
            role: "model",
            parts: [
              {
                functionCall: {
                  name: msg.functionCall.name,
                  args: msg.functionCall.args,
                },
              },
            ],
          };
        }
        if (msg.role === "function" && msg.functionResponse) {
          return {
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: msg.functionResponse.name,
                  response: { content: msg.functionResponse.response },
                },
              },
            ],
          };
        }
        return {
          role: "user" === msg.role ? "user" : "model",
          parts: [{ text: msg.text || "" }],
        };
      }),
    ];

    const chat = model.startChat({
      history: chatHistory as any, // Type cast to avoid strict strictness issues with mapped history
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    let result;
    if (functionResponse) {
      // We are sending the RESULT of a function execution
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: functionResponse.name,
            response: functionResponse.response,
          },
        },
      ]);
    } else if (newMessage) {
      // Normal user message
      result = await chat.sendMessage(newMessage);
    } else {
      throw new Error("No message or function response to send.");
    }

    const response = await result.response;
    const functionCall = response.functionCalls()?.[0]; // Check for function call
    const text = response.text();

    if (functionCall) {
      return {
        functionCall: {
          name: functionCall.name,
          args: functionCall.args,
        },
      };
    }

    return { text };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      text: "I'm having trouble connecting to the financial brain right now. Please try again later.",
    };
  }
};
