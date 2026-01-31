import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  X,
  Save,
  Trash2,
  Link as LinkIcon,
  Pin,
  Palette,
  Tag,
  Plus,
  Sparkles,
  CheckCircle,
  Link2Off,
  ChevronDown,
} from "lucide-react-native";
import { GlassView } from "../ui/GlassView";
import { Note, Task, NoteColor, ExtractedTask } from "../../types";
import AIActionsSheet from "./AIActionsSheet";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface NoteEditorProps {
  note?: Note | null;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  onDelete?: (noteId: string) => void;
  onCreateTask?: (task: ExtractedTask) => void;
}

const NOTE_COLORS: { value: NoteColor; label: string; color: string }[] = [
  { value: "default", label: "Default", color: "#94a3b8" },
  { value: "red", label: "Red", color: "#f87171" },
  { value: "orange", label: "Orange", color: "#fb923c" },
  { value: "yellow", label: "Yellow", color: "#facc15" },
  { value: "green", label: "Green", color: "#4ade80" },
  { value: "blue", label: "Blue", color: "#60a5fa" },
  { value: "purple", label: "Purple", color: "#a78bfa" },
];

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  tasks,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCreateTask,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [taskId, setTaskId] = useState<string | undefined>();
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>("default");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [showAISheet, setShowAISheet] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setSummary(note.summary || "");
      setTags(note.tags || []);
      setTaskId(note.taskId);
      setIsPinned(note.isPinned || false);
      setColor(note.color || "default");
      setExtractedTasks(note.extractedTasks || []);
    } else {
      resetForm();
    }
  }, [note]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setTags([]);
    setNewTag("");
    setTaskId(undefined);
    setIsPinned(false);
    setColor("default");
    setExtractedTasks([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave({
        id: note?.id,
        title: title || "Untitled Note",
        content,
        summary,
        tags,
        taskId,
        isPinned,
        color,
        extractedTasks,
      });
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (note?.id && onDelete) {
            onDelete(note.id);
            onClose();
          }
        },
      },
    ]);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const selectedTask = tasks.find((t) => t.id === taskId);

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <X size={20} color="#64748b" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            {note ? "Edit Note" : "New Note"}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="p-2 bg-purple-500 rounded-full">
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Save size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Quick Actions */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setIsPinned(!isPinned)}
              className={`flex-row items-center px-3 py-2 rounded-lg ${
                isPinned
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}>
              <Pin
                size={16}
                color={isPinned ? "#f59e0b" : "#64748b"}
                fill={isPinned ? "#f59e0b" : "transparent"}
              />
              <Text
                className={`ml-1 text-xs font-bold ${
                  isPinned
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-500"
                }`}>
                Pin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowColorPicker(!showColorPicker)}
              className="flex-row items-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <View
                className="w-4 h-4 rounded-full mr-1"
                style={{
                  backgroundColor:
                    NOTE_COLORS.find((c) => c.value === color)?.color ||
                    "#94a3b8",
                }}
              />
              <Text className="text-xs font-bold text-slate-500">Color</Text>
              <ChevronDown size={12} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAISheet(true)}
              className="flex-row items-center px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Sparkles size={16} color="#8b5cf6" />
              <Text className="ml-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                AI
              </Text>
            </TouchableOpacity>
          </View>

          {/* Color Picker */}
          {showColorPicker && (
            <View className="flex-row gap-2 mb-4 p-3 bg-white dark:bg-slate-800 rounded-xl">
              {NOTE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => {
                    setColor(c.value);
                    setShowColorPicker(false);
                  }}
                  className="p-1">
                  <View
                    className={`w-8 h-8 rounded-full ${
                      color === c.value ? "border-2 border-slate-900" : ""
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Title */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Note title..."
              placeholderTextColor="#94a3b8"
              className="bg-white dark:bg-slate-800 p-4 rounded-xl text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-slate-700"
            />
          </View>

          {/* Content */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
              Content
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your note..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              className="bg-white dark:bg-slate-800 p-4 rounded-xl text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700 min-h-[200px]"
            />
          </View>

          {/* Summary (if generated) */}
          {summary ? (
            <View className="mb-4 p-4 rounded-xl bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
                  ✨ AI Summary
                </Text>
                <TouchableOpacity onPress={() => setSummary("")}>
                  <Text className="text-xs text-slate-400">Clear</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-purple-700 dark:text-purple-300 text-sm">
                {summary}
              </Text>
            </View>
          ) : null}

          {/* Extracted Tasks */}
          {extractedTasks.length > 0 && (
            <View className="mb-4 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  ✨ Extracted Tasks
                </Text>
                <TouchableOpacity onPress={() => setExtractedTasks([])}>
                  <Text className="text-xs text-slate-400">Clear</Text>
                </TouchableOpacity>
              </View>
              {extractedTasks.map((task, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg mb-2">
                  <View className="flex-row items-center gap-2">
                    <CheckCircle size={16} color="#10b981" />
                    <Text className="text-slate-900 dark:text-white text-sm">
                      {task.title}
                    </Text>
                  </View>
                  {onCreateTask && (
                    <TouchableOpacity onPress={() => onCreateTask(task)}>
                      <Text className="text-purple-600 text-xs font-bold">
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Link to Task */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
              Link to Task (Optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowTaskPicker(!showTaskPicker)}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center gap-2">
                {taskId ? (
                  <>
                    <LinkIcon size={16} color="#8b5cf6" />
                    <Text className="text-slate-900 dark:text-white font-medium">
                      {selectedTask?.title || "Unknown Task"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Link2Off size={16} color="#94a3b8" />
                    <Text className="text-slate-400 font-medium">
                      No task linked
                    </Text>
                  </>
                )}
              </View>
              <ChevronDown size={16} color="#64748b" />
            </TouchableOpacity>

            {showTaskPicker && (
              <View className="mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40">
                <ScrollView>
                  <TouchableOpacity
                    onPress={() => {
                      setTaskId(undefined);
                      setShowTaskPicker(false);
                    }}
                    className="flex-row items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-700">
                    <Link2Off size={14} color="#94a3b8" />
                    <Text className="text-slate-500">No task</Text>
                  </TouchableOpacity>
                  {tasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => {
                        setTaskId(task.id);
                        setShowTaskPicker(false);
                      }}
                      className={`flex-row items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-700 ${
                        taskId === task.id
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : ""
                      }`}>
                      <View
                        className={`w-2 h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-emerald-500"
                            : task.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                        }`}
                      />
                      <Text className="text-slate-900 dark:text-white">
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Tags */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <View
                  key={tag}
                  className="flex-row items-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                  <Tag size={12} color="#64748b" />
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold ml-1">
                    {tag}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeTag(tag)}
                    className="ml-2">
                    <X size={12} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View className="flex-row gap-2">
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={addTag}
                className="flex-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700"
              />
              <TouchableOpacity
                onPress={addTag}
                className="px-3 py-2 bg-purple-500 rounded-lg">
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Button */}
          {note && onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
              <Trash2 size={18} color="#ef4444" />
              <Text className="text-red-500 font-bold">Delete Note</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* AI Actions Sheet */}
        <AIActionsSheet
          isOpen={showAISheet}
          content={content}
          onClose={() => setShowAISheet(false)}
          onSummaryGenerated={setSummary}
          onContentEnhanced={setContent}
          onTagsGenerated={(newTags) =>
            setTags([...new Set([...tags, ...newTags])])
          }
          onTasksExtracted={(tasks) =>
            setExtractedTasks([...extractedTasks, ...tasks])
          }
          onContentExpanded={setContent}
          onMeetingFormatted={setContent}
        />
      </View>
    </Modal>
  );
};

export default NoteEditor;
