import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  Link,
  Link2Off,
  Pin,
  Palette,
  Tag,
  Plus,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Note, Task, NoteColor, ExtractedTask } from "../../types";
import AIToolbar from "./AIToolbar";

interface NoteEditorProps {
  note?: Note | null;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  onDelete?: (noteId: string) => void;
  onCreateTask?: (task: ExtractedTask) => void;
  theme: string;
}

const NOTE_COLORS: { value: NoteColor; label: string; class: string }[] = [
  {
    value: "default",
    label: "Default",
    class: "bg-slate-200 dark:bg-slate-600",
  },
  { value: "red", label: "Red", class: "bg-red-400" },
  { value: "orange", label: "Orange", class: "bg-orange-400" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-400" },
  { value: "green", label: "Green", class: "bg-green-400" },
  { value: "blue", label: "Blue", class: "bg-blue-400" },
  { value: "purple", label: "Purple", class: "bg-purple-400" },
];

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  tasks,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCreateTask,
  theme,
}) => {
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

  // Load note data when editing
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

  const handleSave = () => {
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
  };

  const handleDelete = () => {
    if (note?.id && onDelete) {
      onDelete(note.id);
      onClose();
    }
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

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const selectedTask = tasks.find((t) => t.id === taskId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Editor Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 animate-slide-up border ${
          theme === "dark"
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
            {note ? "Edit Note" : "New Note"}
          </h2>
          <div className="flex items-center gap-2">
            {/* Pin Button */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg transition-colors ${
                isPinned
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  : theme === "dark"
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-400"
              }`}
              title={isPinned ? "Unpin" : "Pin"}>
              <Pin className="w-5 h-5" />
            </button>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-400"
                }`}
                title="Note Color">
                <Palette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div
                  className={`absolute right-0 top-full mt-2 p-2 rounded-xl shadow-lg border z-10 ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-slate-200"
                  }`}>
                  <div className="flex gap-1">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setColor(c.value);
                          setShowColorPicker(false);
                        }}
                        className={`w-6 h-6 rounded-full ${c.class} ${
                          color === c.value
                            ? "ring-2 ring-offset-2 ring-brand-500"
                            : ""
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-400"
              }`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className={`w-full px-4 py-3 rounded-xl mb-4 font-bold text-lg border focus:ring-2 focus:ring-brand-500 outline-none ${
            theme === "dark"
              ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
          }`}
        />

        {/* AI Toolbar */}
        <div className="mb-4">
          <AIToolbar
            content={content}
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
            theme={theme}
          />
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={8}
          className={`w-full px-4 py-3 rounded-xl mb-4 resize-none border focus:ring-2 focus:ring-brand-500 outline-none ${
            theme === "dark"
              ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
          }`}
        />

        {/* Summary (if generated) */}
        {summary && (
          <div
            className={`mb-4 p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-purple-900/20 border-purple-800"
                : "bg-purple-50 border-purple-200"
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold uppercase ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}>
                ✨ AI Summary
              </span>
              <button
                onClick={() => setSummary("")}
                className="text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            </div>
            <p
              className={`text-sm whitespace-pre-line ${
                theme === "dark" ? "text-purple-300" : "text-purple-700"
              }`}>
              {summary}
            </p>
          </div>
        )}

        {/* Extracted Tasks */}
        {extractedTasks.length > 0 && (
          <div
            className={`mb-4 p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-emerald-900/20 border-emerald-800"
                : "bg-emerald-50 border-emerald-200"
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}>
                ✨ Extracted Tasks
              </span>
              <button
                onClick={() => setExtractedTasks([])}
                className="text-xs text-slate-400 hover:text-slate-600">
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {extractedTasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    theme === "dark" ? "bg-slate-800" : "bg-white"
                  }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-white" : "text-slate-700"
                      }`}>
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : task.priority === "medium"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                  {onCreateTask && (
                    <button
                      onClick={() => onCreateTask(task)}
                      className="text-xs font-bold text-brand-500 hover:text-brand-600">
                      Add Task
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Linking */}
        <div className="mb-4">
          <label
            className={`block text-sm font-bold mb-2 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
            Link to Task (Optional)
          </label>
          <div className="relative">
            <button
              onClick={() => setShowTaskPicker(!showTaskPicker)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
              <div className="flex items-center gap-2">
                {taskId ? (
                  <>
                    <Link className="w-4 h-4 text-brand-500" />
                    <span>{selectedTask?.title || "Unknown Task"}</span>
                  </>
                ) : (
                  <>
                    <Link2Off className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">No task linked</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showTaskPicker && (
              <div
                className={`absolute left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-xl shadow-lg border z-20 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}>
                <button
                  onClick={() => {
                    setTaskId(undefined);
                    setShowTaskPicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                    theme === "dark"
                      ? "hover:bg-slate-700 text-slate-300"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}>
                  <Link2Off className="w-4 h-4" />
                  No task linked
                </button>
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setTaskId(task.id);
                      setShowTaskPicker(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                      theme === "dark"
                        ? "hover:bg-slate-700 text-white"
                        : "hover:bg-slate-50 text-slate-800"
                    } ${taskId === task.id ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === "completed"
                          ? "bg-emerald-500"
                          : task.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                      }`}
                    />
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label
            className={`block text-sm font-bold mb-2 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}>
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag..."
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
              }`}
            />
            <button
              onClick={addTag}
              className="px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
          {note && onDelete ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                theme === "dark"
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium shadow-lg shadow-brand-500/30">
              <Save className="w-4 h-4" />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
