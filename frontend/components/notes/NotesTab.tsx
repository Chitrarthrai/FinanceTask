import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
  X,
} from "lucide-react";
import { Note, Task, ExtractedTask } from "../../types";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";

interface NotesTabProps {
  notes: Note[];
  tasks: Task[];
  onAddNote: (note: Partial<Note>) => void;
  onUpdateNote: (note: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onPinNote: (noteId: string, isPinned: boolean) => void;
  onCreateTask?: (task: ExtractedTask) => void;
  theme: string;
}

const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  tasks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onPinNote,
  onCreateTask,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Tag filter
    if (filterTag) {
      result = result.filter((note) => note.tags?.includes(filterTag));
    }

    // Sort: Pinned first, then by updated date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, filterTag]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (noteData.id) {
      onUpdateNote(noteData);
    } else {
      onAddNote(noteData);
    }
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    onDeleteNote(noteId);
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  // Get linked task for a note
  const getLinkedTask = (taskId?: string) => {
    if (!taskId) return undefined;
    return tasks.find((t) => t.id === taskId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
            Notes
          </h2>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
            {notes.length} note{notes.length !== 1 ? "s" : ""} • AI-powered
          </p>
        </div>

        <div className="flex gap-3">
          {/* View Toggle */}
          <div
            className={`flex rounded-xl p-1 border ${
              theme === "dark"
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white border-slate-200"
            }`}>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Grid View">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="List View">
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Add Note Button */}
          <button
            onClick={handleNewNote}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-95">
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-all text-sm font-medium ${
              theme === "dark"
                ? "bg-slate-800/40 border-slate-700/50 focus:bg-slate-900 text-white placeholder:text-slate-500"
                : "bg-white border-slate-200 focus:bg-white text-slate-800 placeholder:text-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterTag === null
                  ? "bg-brand-500 text-white"
                  : theme === "dark"
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              All
            </button>
            {allTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterTag === tag
                    ? "bg-brand-500 text-white"
                    : theme === "dark"
                      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}>
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      {filteredNotes.length > 0 ? (
        <div
          className={`flex-1 overflow-y-auto ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3"
          }`}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              linkedTask={getLinkedTask(note.taskId)}
              onClick={handleNoteClick}
              onPin={onPinNote}
              theme={theme}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              theme === "dark" ? "bg-slate-800" : "bg-slate-100"
            }`}>
            <FileText
              className={`w-10 h-10 ${
                theme === "dark" ? "text-slate-600" : "text-slate-300"
              }`}
            />
          </div>
          <h3
            className={`text-lg font-bold mb-2 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
            {searchQuery || filterTag ? "No notes found" : "No notes yet"}
          </h3>
          <p
            className={`text-sm mb-4 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}>
            {searchQuery || filterTag
              ? "Try a different search or filter"
              : "Create your first note with AI-powered features"}
          </p>
          {!searchQuery && !filterTag && (
            <button
              onClick={handleNewNote}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all">
              <Plus className="w-5 h-5" />
              Create Note
            </button>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      <NoteEditor
        note={selectedNote}
        tasks={tasks}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onCreateTask={onCreateTask}
        theme={theme}
      />
    </div>
  );
};

export default NotesTab;
