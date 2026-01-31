/**
 * Gemini AI Service for Notes
 * Uses Google Gemini API for AI-powered note features
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

interface ExtractedTask {
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
}

/**
 * Make a request to Gemini API
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No response from Gemini");
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Smart Summarization - Summarize notes into key bullet points
 */
export async function summarizeNote(
  content: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Summarize the following text into 3-5 concise key bullet points. Return only the bullet points, no introduction or conclusion.

Text:
${content}

Summary:`;

  const response = await callGemini(prompt, apiKey);
  return response.trim();
}

/**
 * Grammar & Writing Enhancement - Fix spelling, grammar, and improve clarity
 */
export async function enhanceWriting(
  content: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Improve the following text by fixing any spelling mistakes, grammar errors, and enhancing clarity. Keep the same meaning and tone. Return only the improved text, nothing else.

Original text:
${content}

Improved text:`;

  const response = await callGemini(prompt, apiKey);
  return response.trim();
}

/**
 * Auto-Tagging - Generate relevant tags from content
 */
export async function generateTags(
  content: string,
  apiKey: string,
): Promise<string[]> {
  const prompt = `Extract 3-5 relevant tags/keywords from the following text. Return them as a JSON array of lowercase strings, nothing else. Example: ["work", "meeting", "project"]

Text:
${content}

Tags:`;

  const response = await callGemini(prompt, apiKey);

  try {
    // Try to extract JSON array from response
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    // If parsing fails, extract words manually
    const words = response.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return [...new Set(words)].slice(0, 5);
  }
}

/**
 * Task Extraction - Identify action items from note content
 */
export async function extractTasks(
  content: string,
  apiKey: string,
): Promise<ExtractedTask[]> {
  const prompt = `Analyze the following text and extract any action items or tasks mentioned. Return them as a JSON array with objects containing: title (string), priority ("low", "medium", or "high"), and optionally assignee (string) if mentioned. Return only the JSON array, nothing else. If no tasks found, return an empty array [].

Text:
${content}

Tasks:`;

  const response = await callGemini(prompt, apiKey);

  try {
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      const tasks = JSON.parse(jsonMatch[0]);
      return tasks.map((task: any) => ({
        title: task.title || "",
        priority: ["low", "medium", "high"].includes(task.priority)
          ? task.priority
          : "medium",
        dueDate: task.dueDate,
        assignee: task.assignee,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Content Expansion - Expand brief notes into detailed descriptions
 */
export async function expandContent(
  content: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Expand the following brief note into a more detailed and well-structured description. Add relevant context and details while keeping the original meaning. Return only the expanded text.

Brief note:
${content}

Expanded version:`;

  const response = await callGemini(prompt, apiKey);
  return response.trim();
}

/**
 * Meeting Notes Formatter - Structure raw meeting notes
 */
export async function formatMeetingNotes(
  content: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Format the following raw meeting notes into a well-structured format with:
- Meeting Summary (1-2 sentences)
- Key Discussion Points (bullet list)
- Action Items (with assignees if mentioned)
- Decisions Made (if any)

Return only the formatted notes in markdown format.

Raw notes:
${content}

Formatted meeting notes:`;

  const response = await callGemini(prompt, apiKey);
  return response.trim();
}

/**
 * Smart Templates - Generate note template based on task type
 */
export async function generateTemplate(
  taskType: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Generate a useful note template for the following type of task/note: "${taskType}". 
Include relevant sections and placeholder text that the user can fill in.
Return only the template in markdown format.

Template:`;

  const response = await callGemini(prompt, apiKey);
  return response.trim();
}

/**
 * Sentiment/Priority Detection - Detect urgency from content
 */
export async function detectPriority(
  content: string,
  apiKey: string,
): Promise<"low" | "medium" | "high"> {
  const prompt = `Analyze the following text and determine its urgency/priority level. Consider words like "urgent", "ASAP", "deadline", "critical" as high priority indicators. Return only one word: "low", "medium", or "high".

Text:
${content}

Priority:`;

  const response = await callGemini(prompt, apiKey);
  const priority = response.toLowerCase().trim();

  if (priority.includes("high")) return "high";
  if (priority.includes("low")) return "low";
  return "medium";
}

/**
 * Related Notes Suggestion - Find related content keywords
 */
export async function suggestRelatedKeywords(
  content: string,
  apiKey: string,
): Promise<string[]> {
  const prompt = `Based on the following note content, suggest 3-5 related topics or keywords that the user might want to search for to find related notes. Return as a JSON array of strings.

Note content:
${content}

Related keywords:`;

  const response = await callGemini(prompt, apiKey);

  try {
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    return [];
  }
}

// Export all functions as a service object
export const geminiService = {
  summarize: summarizeNote,
  enhance: enhanceWriting,
  generateTags,
  extractTasks,
  expand: expandContent,
  formatMeeting: formatMeetingNotes,
  generateTemplate,
  detectPriority,
  suggestRelated: suggestRelatedKeywords,
};

export default geminiService;
