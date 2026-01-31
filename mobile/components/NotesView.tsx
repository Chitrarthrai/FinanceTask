import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ScreenWrapper } from "./ui/ScreenWrapper"; // Ensure correct import path
import { ViewToggle } from "./ui/ViewToggle";

import { GlassView } from "./ui/GlassView";
import { useData } from "../context/DataContext";
import { Note, Task, ExtractedTask } from "../types";
import {
  Plus,
  Search,
  X,
  FileText,
  Pin,
  Tag,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react-native";
import NoteCard from "./notes/NoteCard";
import NoteEditor from "./notes/NoteEditor";

const NotesView = () => {
  const { notes, tasks, addNote, updateNote, deleteNote, pinNote, addTask } =
    useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
      .filter((n) => (selectedTag ? n.tags.includes(selectedTag) : true));
  }, [notes, searchQuery, selectedTag]);

  const handleCreateTaskFromNote = (extractedTask: ExtractedTask) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title: extractedTask.title,
      description: "",
      status: "todo",
      priority: extractedTask.priority || "medium",
      dueDate: extractedTask.dueDate || "",
      recurring: false,
      tags: [],
      category: "Personal",
    };
    addTask(task);
  };

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (note: Partial<Note>) => {
    if (selectedNote) {
      updateNote({ ...note, id: selectedNote.id });
    } else {
      addNote(note);
    }
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  return (
    <ScreenWrapper>
      {/* View Toggle */}
      <ViewToggle activeView="notes" />

      <View className="flex-1">
        <View className="px-4 py-4 z-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Notes
            </Text>
            <View className="flex-row gap-2 items-center">
              {/* View Toggle - List/Grid */}
              <View className="flex-row bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <TouchableOpacity
                  onPress={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-white dark:bg-slate-700" : ""}`}>
                  <ListIcon
                    size={16}
                    color={viewMode === "list" ? "#8b5cf6" : "#64748b"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white dark:bg-slate-700" : ""}`}>
                  <LayoutGrid
                    size={16}
                    color={viewMode === "grid" ? "#8b5cf6" : "#64748b"}
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 px-3 py-1 rounded-full">
                <Text className="text-purple-600 dark:text-purple-300 font-bold text-xs">
                  {notes.length} Notes
                </Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <GlassView
            intensity={20}
            className="flex-row items-center rounded-2xl px-4 py-3 border border-black/5 dark:border-white/20 bg-white/40 dark:bg-white/10 mb-3">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 font-medium text-slate-900 dark:text-white text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </GlassView>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-2">
              {selectedTag && (
                <TouchableOpacity
                  onPress={() => setSelectedTag(null)}
                  className="flex-row items-center px-3 py-1.5 rounded-full bg-purple-500">
                  <Text className="text-white text-xs font-bold mr-1">
                    Clear
                  </Text>
                  <X size={12} color="white" />
                </TouchableOpacity>
              )}
              {allTags.slice(0, 5).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                  className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    selectedTag === tag
                      ? "bg-purple-500"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}>
                  <Tag
                    size={12}
                    color={selectedTag === tag ? "white" : "#64748b"}
                  />
                  <Text
                    className={`text-xs font-bold ml-1 ${
                      selectedTag === tag
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes List */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render when switching modes
          renderItem={({ item }) => (
            <View className={viewMode === "grid" ? "flex-1 px-2" : "px-4"}>
              <NoteCard
                note={item}
                linkedTask={tasks.find((t) => t.id === item.taskId)}
                onPress={() => handleOpenNote(item)}
                onPin={(id, isPinned) => pinNote(id, isPinned)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <FileText size={64} color="rgba(255,255,255,0.2)" />
              <Text className="text-slate-400 mt-4 font-medium text-lg">
                No notes yet
              </Text>
              <Text className="text-slate-500 text-sm mt-1">
                Tap + to create your first note
              </Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute bottom-28 right-6 w-14 h-14 bg-purple-500 rounded-full items-center justify-center shadow-lg shadow-purple-500/40 border border-white/20 z-50"
          onPress={handleNewNote}>
          <Plus color="white" size={30} />
        </TouchableOpacity>

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
          onDelete={(id) => {
            deleteNote(id);
            setIsEditorOpen(false);
            setSelectedNote(null);
          }}
          onCreateTask={handleCreateTaskFromNote}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NotesView;
