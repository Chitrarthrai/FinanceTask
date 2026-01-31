import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FileText, Pin, Tag, Link as LinkIcon } from "lucide-react-native";
import { Note, Task } from "../../types";

interface NoteCardProps {
  note: Note;
  linkedTask?: Task;
  onPress: () => void;
  onPin: (noteId: string, isPinned: boolean) => void;
}

const NOTE_COLORS: Record<
  string,
  { bg: string; darkBg: string; border: string }
> = {
  default: {
    bg: "bg-white",
    darkBg: "dark:bg-slate-800",
    border: "border-slate-200",
  },
  red: {
    bg: "bg-red-50",
    darkBg: "dark:bg-red-900/20",
    border: "border-red-200",
  },
  orange: {
    bg: "bg-orange-50",
    darkBg: "dark:bg-orange-900/20",
    border: "border-orange-200",
  },
  yellow: {
    bg: "bg-yellow-50",
    darkBg: "dark:bg-yellow-900/20",
    border: "border-yellow-200",
  },
  green: {
    bg: "bg-green-50",
    darkBg: "dark:bg-green-900/20",
    border: "border-green-200",
  },
  blue: {
    bg: "bg-blue-50",
    darkBg: "dark:bg-blue-900/20",
    border: "border-blue-200",
  },
  purple: {
    bg: "bg-purple-50",
    darkBg: "dark:bg-purple-900/20",
    border: "border-purple-200",
  },
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  linkedTask,
  onPress,
  onPin,
}) => {
  const colorStyles = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`p-4 rounded-2xl border mb-3 ${colorStyles.bg} ${colorStyles.darkBg} ${colorStyles.border} dark:border-slate-700`}>
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <FileText size={16} color="#94a3b8" />
          {note.isPinned && <Pin size={12} color="#f59e0b" fill="#f59e0b" />}
        </View>
        <TouchableOpacity
          onPress={() => onPin(note.id, !note.isPinned)}
          className={`p-1.5 rounded-lg ${
            note.isPinned
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-slate-100 dark:bg-slate-700"
          }`}>
          <Pin
            size={14}
            color={note.isPinned ? "#f59e0b" : "#94a3b8"}
            fill={note.isPinned ? "#f59e0b" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text
        className="text-slate-900 dark:text-white font-bold text-base mb-1"
        numberOfLines={1}>
        {note.title || "Untitled Note"}
      </Text>

      {/* Content Preview */}
      <Text
        className="text-slate-500 dark:text-slate-400 text-sm mb-3"
        numberOfLines={2}>
        {note.content || "No content"}
      </Text>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <View
              key={idx}
              className="flex-row items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
              <Tag size={10} color="#64748b" />
              <Text className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase ml-1">
                {tag}
              </Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text className="text-slate-400 text-[10px] font-bold">
              +{note.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
        {linkedTask ? (
          <View className="flex-row items-center gap-1">
            <LinkIcon size={12} color="#8b5cf6" />
            <Text
              className="text-purple-600 dark:text-purple-400 text-xs font-medium"
              numberOfLines={1}>
              {linkedTask.title}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Text className="text-slate-400 text-xs font-medium">
          {formatDate(note.updatedAt)}
        </Text>
      </View>

      {/* AI Summary Indicator */}
      {note.summary && (
        <View className="mt-2 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/20">
          <Text className="text-purple-600 dark:text-purple-400 text-[10px] font-bold">
            ✨ AI Summary available
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NoteCard;
