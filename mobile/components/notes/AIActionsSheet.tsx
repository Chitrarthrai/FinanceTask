import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  Sparkles,
  FileText,
  Tag,
  CheckSquare,
  Expand,
  Calendar,
  X,
  Wand2,
} from "lucide-react-native";
import { GlassView } from "../ui/GlassView";
import { geminiService } from "../../lib/gemini";
import { ExtractedTask } from "../../types";

interface AIActionsSheetProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onSummaryGenerated: (summary: string) => void;
  onContentEnhanced: (content: string) => void;
  onTagsGenerated: (tags: string[]) => void;
  onTasksExtracted: (tasks: ExtractedTask[]) => void;
  onContentExpanded: (content: string) => void;
  onMeetingFormatted: (content: string) => void;
}

type AIAction =
  | "summarize"
  | "enhance"
  | "tags"
  | "tasks"
  | "expand"
  | "meeting";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  loading: boolean;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  description,
  loading,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.7}
    className="flex-row items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
    <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
      {loading ? <ActivityIndicator size="small" color="#8b5cf6" /> : icon}
    </View>
    <View className="flex-1">
      <Text className="text-slate-900 dark:text-white font-bold text-sm">
        {label}
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 text-xs">
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

const AIActionsSheet: React.FC<AIActionsSheetProps> = ({
  isOpen,
  content,
  onClose,
  onSummaryGenerated,
  onContentEnhanced,
  onTagsGenerated,
  onTasksExtracted,
  onContentExpanded,
  onMeetingFormatted,
}) => {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Access API key from environment variable
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_NOTES_API_KEY;

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
          onClose();
          break;
        }
        case "enhance": {
          const enhanced = await geminiService.enhance(content, apiKey);
          onContentEnhanced(enhanced);
          onClose();
          break;
        }
        case "tags": {
          const tags = await geminiService.generateTags(content, apiKey);
          onTagsGenerated(tags);
          onClose();
          break;
        }
        case "tasks": {
          const tasks = await geminiService.extractTasks(content, apiKey);
          onTasksExtracted(tasks);
          onClose();
          break;
        }
        case "expand": {
          const expanded = await geminiService.expand(content, apiKey);
          onContentExpanded(expanded);
          onClose();
          break;
        }
        case "meeting": {
          const formatted = await geminiService.formatMeeting(content, apiKey);
          onMeetingFormatted(formatted);
          onClose();
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

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 bg-black/50">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1"
      />
      <GlassView
        intensity={40}
        className="bg-white/95 dark:bg-slate-900/90 rounded-t-3xl p-6 border-t border-slate-200 dark:border-white/20">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-2">
            <Sparkles size={20} color="#8b5cf6" />
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              AI Assistant
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mb-4">
            <Text className="text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </Text>
          </View>
        )}

        {/* Actions */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <ActionButton
            icon={<FileText size={18} color="#8b5cf6" />}
            label="Summarize"
            description="Generate key points from your note"
            loading={loading === "summarize"}
            onPress={() => handleAction("summarize")}
          />

          <ActionButton
            icon={<Wand2 size={18} color="#8b5cf6" />}
            label="Enhance Writing"
            description="Fix grammar and improve clarity"
            loading={loading === "enhance"}
            onPress={() => handleAction("enhance")}
          />

          <ActionButton
            icon={<Tag size={18} color="#8b5cf6" />}
            label="Generate Tags"
            description="Auto-generate relevant tags"
            loading={loading === "tags"}
            onPress={() => handleAction("tags")}
          />

          <ActionButton
            icon={<CheckSquare size={18} color="#8b5cf6" />}
            label="Extract Tasks"
            description="Find action items in your note"
            loading={loading === "tasks"}
            onPress={() => handleAction("tasks")}
          />

          <ActionButton
            icon={<Expand size={18} color="#8b5cf6" />}
            label="Expand Content"
            description="Expand brief notes into details"
            loading={loading === "expand"}
            onPress={() => handleAction("expand")}
          />

          <ActionButton
            icon={<Calendar size={18} color="#8b5cf6" />}
            label="Format as Meeting Notes"
            description="Structure as professional meeting notes"
            loading={loading === "meeting"}
            onPress={() => handleAction("meeting")}
          />
        </ScrollView>
      </GlassView>
    </View>
  );
};

export default AIActionsSheet;
