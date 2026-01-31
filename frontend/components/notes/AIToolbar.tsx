import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  Tag,
  CheckSquare,
  Expand,
  Calendar,
  Loader2,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { geminiService } from "../../lib/gemini";
import { ExtractedTask } from "../../types";

interface AIToolbarProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
  onContentEnhanced: (content: string) => void;
  onTagsGenerated: (tags: string[]) => void;
  onTasksExtracted: (tasks: ExtractedTask[]) => void;
  onContentExpanded: (content: string) => void;
  onMeetingFormatted: (content: string) => void;
  theme: string;
}

type AIAction =
  | "summarize"
  | "enhance"
  | "tags"
  | "tasks"
  | "expand"
  | "meeting";

const AIToolbar: React.FC<AIToolbarProps> = ({
  content,
  onSummaryGenerated,
  onContentEnhanced,
  onTagsGenerated,
  onTasksExtracted,
  onContentExpanded,
  onMeetingFormatted,
  theme,
}) => {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_NOTES_API_KEY;

  const handleAction = async (action: AIAction) => {
    if (!content.trim()) {
      setError("Please add some content first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!apiKey) {
      setError("Gemini API key not configured");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(action);
    setError(null);

    try {
      switch (action) {
        case "summarize": {
          const summary = await geminiService.summarize(content, apiKey);
          onSummaryGenerated(summary);
          break;
        }
        case "enhance": {
          const enhanced = await geminiService.enhance(content, apiKey);
          onContentEnhanced(enhanced);
          break;
        }
        case "tags": {
          const tags = await geminiService.generateTags(content, apiKey);
          onTagsGenerated(tags);
          break;
        }
        case "tasks": {
          const tasks = await geminiService.extractTasks(content, apiKey);
          onTasksExtracted(tasks);
          break;
        }
        case "expand": {
          const expanded = await geminiService.expand(content, apiKey);
          onContentExpanded(expanded);
          break;
        }
        case "meeting": {
          const formatted = await geminiService.formatMeeting(content, apiKey);
          onMeetingFormatted(formatted);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI action failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(null);
    }
  };

  const buttonClass = (isLoading: boolean) => `
    flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
    transition-all duration-200 border
    ${
      isLoading
        ? "opacity-50 cursor-not-allowed"
        : "hover:scale-105 active:scale-95 cursor-pointer"
    }
    ${
      theme === "dark"
        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm"
    }
  `;

  return (
    <div className="space-y-2">
      {/* AI Label */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 text-xs font-bold ${
            theme === "dark" ? "text-purple-400" : "text-purple-600"
          }`}>
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </div>
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Summarize */}
        <button
          onClick={() => handleAction("summarize")}
          disabled={loading !== null}
          className={buttonClass(loading === "summarize")}
          title="Generate a summary of your note">
          {loading === "summarize" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          Summarize
        </button>

        {/* Enhance Writing */}
        <button
          onClick={() => handleAction("enhance")}
          disabled={loading !== null}
          className={buttonClass(loading === "enhance")}
          title="Fix grammar and improve clarity">
          {loading === "enhance" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          Enhance
        </button>

        {/* Generate Tags */}
        <button
          onClick={() => handleAction("tags")}
          disabled={loading !== null}
          className={buttonClass(loading === "tags")}
          title="Auto-generate relevant tags">
          {loading === "tags" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Tag className="w-3.5 h-3.5" />
          )}
          Tags
        </button>

        {/* Extract Tasks */}
        <button
          onClick={() => handleAction("tasks")}
          disabled={loading !== null}
          className={buttonClass(loading === "tasks")}
          title="Extract action items as tasks">
          {loading === "tasks" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckSquare className="w-3.5 h-3.5" />
          )}
          Extract Tasks
        </button>

        {/* Expand Content */}
        <button
          onClick={() => handleAction("expand")}
          disabled={loading !== null}
          className={buttonClass(loading === "expand")}
          title="Expand brief notes into detailed descriptions">
          {loading === "expand" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Expand className="w-3.5 h-3.5" />
          )}
          Expand
        </button>

        {/* Format Meeting Notes */}
        <button
          onClick={() => handleAction("meeting")}
          disabled={loading !== null}
          className={buttonClass(loading === "meeting")}
          title="Format as structured meeting notes">
          {loading === "meeting" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          Meeting Notes
        </button>
      </div>
    </div>
  );
};

export default AIToolbar;
