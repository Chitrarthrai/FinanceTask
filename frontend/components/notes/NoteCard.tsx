import React from 'react';
import { FileText, Pin, Link as LinkIcon, Tag, Sparkles, CheckSquare, Plus } from 'lucide-react';
import { Note, Task } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface NoteCardProps {
  note: Note;
  linkedTask?: Task;
  onClick: (note: Note) => void;
  onPin: (noteId: string, isPinned: boolean) => void;
  theme: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  linkedTask,
  onClick,
  onPin,
}) => {
  const { addTask } = useData();

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(note.id, !note.isPinned);
  };

  const handleConvertToTask = async (e: React.MouseEvent, itemTitle: string) => {
    e.stopPropagation();
    await addTask({
      id: crypto.randomUUID(),
      title: itemTitle,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date().toISOString(),
      tags: ['Extracted', 'AI Note'],
    });
    alert(`Task '${itemTitle}' added to Operations Kanban!`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card
      variant="glass"
      hoverable
      glowColor={note.isPinned ? 'cyan' : 'none'}
      padding="sm"
      onClick={() => onClick(note)}
      className="cursor-pointer space-y-2.5 relative flex flex-col justify-between h-full"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
            {note.isPinned && (
              <Pin className="w-3.5 h-3.5 text-[var(--warning)] fill-[var(--warning)]" />
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePinClick}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`} />
          </Button>
        </div>

        <div>
          <h3 className="font-bold text-sm text-[var(--text-primary)] truncate font-display">
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mt-1 leading-relaxed">
            {note.content || 'No content written.'}
          </p>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="neutral" size="sm">
                <Tag className="w-2.5 h-2.5 mr-0.5" /> {tag}
              </Badge>
            ))}
          </div>
        )}

        {note.extractedTasks && note.extractedTasks.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] uppercase tracking-wider block">
              Extracted Action Items:
            </span>
            {note.extractedTasks.slice(0, 2).map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[11px]"
              >
                <span className="truncate flex-1 font-medium text-[var(--text-primary)]">{t.title}</span>
                <button
                  onClick={(e) => handleConvertToTask(e, t.title)}
                  className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)] text-[var(--text-inverted)] text-[10px] font-mono font-bold hover:scale-105 transition-transform flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  title="Convert to Kanban Task"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>
            ))}
          </div>
        )}

        {note.summary && (
          <div className="p-1.5 rounded-lg bg-[var(--accent-secondary)]/15 border border-[var(--accent-secondary)]/30 text-[10px] font-mono text-[var(--accent-secondary)] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Summary Available
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-rim)] text-[11px] font-mono text-[var(--text-muted)] mt-2">
        {linkedTask ? (
          <span className="flex items-center gap-1 text-[var(--accent-primary)] truncate max-w-[120px]">
            <LinkIcon className="w-3 h-3" /> {linkedTask.title}
          </span>
        ) : (
          <span />
        )}
        <span>{formatDate(note.updatedAt)}</span>
      </div>
    </Card>
  );
};

export default NoteCard;
