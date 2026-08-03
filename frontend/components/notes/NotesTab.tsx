import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
  X,
} from 'lucide-react';
import { Note, Task, ExtractedTask } from '../../types';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

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

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  tasks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onPinNote,
  onCreateTask,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filterTag) {
      result = result.filter((note) => note.tags?.includes(filterTag));
    }

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

  const getLinkedTask = (taskId?: string) => {
    if (!taskId) return undefined;
    return tasks.find((t) => t.id === taskId);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
          </Badge>
          <span className="text-xs font-mono text-[var(--text-muted)]">AI-assisted workspace</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl glass-panel">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNewNote}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Note
          </Button>
        </div>
      </div>

      {/* Search & Tag Filter Pills */}
      <Card variant="glass" className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search notes content or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
            className="py-1.5 text-xs"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterTag === null
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)]'
                  : 'bg-[var(--surface-l2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  filterTag === tag
                    ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)]'
                    : 'bg-[var(--surface-l2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Notes Display Grid / List */}
      {filteredNotes.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
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
        <Card variant="glass" className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <p className="font-bold text-sm text-[var(--text-primary)]">
            {searchQuery || filterTag ? 'No matching notes found' : 'No notes created yet'}
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {searchQuery || filterTag
              ? 'Try resetting search terms or tag filters.'
              : 'Create your first note to capture ideas, meeting points, and AI-extracted tasks.'}
          </p>
          {!searchQuery && !filterTag && (
            <Button variant="primary" size="sm" onClick={handleNewNote} leftIcon={<Plus className="w-4 h-4" />}>
              Create Note
            </Button>
          )}
        </Card>
      )}

      {/* Note Editor Drawer / Modal */}
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
