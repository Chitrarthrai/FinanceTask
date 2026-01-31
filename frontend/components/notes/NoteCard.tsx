import React from "react";
import { FileText, Pin, Link, Tag, MoreHorizontal } from "lucide-react";
import { Note, Task } from "../../types";

interface NoteCardProps {
  note: Note;
  linkedTask?: Task;
  onClick: (note: Note) => void;
  onPin: (noteId: string, isPinned: boolean) => void;
  theme: string;
}

const NOTE_COLORS: Record<
  string,
  { bg: string; border: string; darkBg: string; darkBorder: string }
> = {
  default: {
    bg: "bg-white",
    border: "border-slate-200",
    darkBg: "dark:bg-slate-800",
    darkBorder: "dark:border-slate-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    darkBg: "dark:bg-red-900/20",
    darkBorder: "dark:border-red-800",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    darkBg: "dark:bg-orange-900/20",
    darkBorder: "dark:border-orange-800",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    darkBg: "dark:bg-yellow-900/20",
    darkBorder: "dark:border-yellow-800",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    darkBg: "dark:bg-green-900/20",
    darkBorder: "dark:border-green-800",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    darkBg: "dark:bg-blue-900/20",
    darkBorder: "dark:border-blue-800",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    darkBg: "dark:bg-purple-900/20",
    darkBorder: "dark:border-purple-800",
  },
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  linkedTask,
  onClick,
  onPin,
  theme,
}) => {
  const colorStyles = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(note.id, !note.isPinned);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div
      onClick={() => onClick(note)}
      className={`
        group p-4 rounded-2xl border cursor-pointer transition-all duration-200
        hover:shadow-lg hover:-translate-y-1
        ${colorStyles.bg} ${colorStyles.border} ${colorStyles.darkBg} ${colorStyles.darkBorder}
      `}>
      {/* Header with pin and actions */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          {note.isPinned && (
            <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePinClick}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            }`}
            title={note.isPinned ? "Unpin" : "Pin"}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-bold mb-1 line-clamp-1 ${
          theme === "dark" ? "text-white" : "text-slate-800"
        }`}>
        {note.title || "Untitled Note"}
      </h3>

      {/* Content preview */}
      <p
        className={`text-sm line-clamp-3 mb-3 ${
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        }`}>
        {note.content || "No content"}
      </p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                theme === "dark"
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}>
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className={`flex items-center justify-between pt-2 border-t ${
          theme === "dark" ? "border-slate-700" : "border-slate-200"
        }`}>
        {/* Linked Task */}
        {linkedTask ? (
          <div className="flex items-center gap-1 text-xs text-brand-500 font-medium">
            <Link className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{linkedTask.title}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Date */}
        <span
          className={`text-xs font-medium ${
            theme === "dark" ? "text-slate-500" : "text-slate-400"
          }`}>
          {formatDate(note.updatedAt)}
        </span>
      </div>

      {/* AI Summary indicator */}
      {note.summary && (
        <div
          className={`mt-2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
            theme === "dark"
              ? "bg-purple-900/20 text-purple-400"
              : "bg-purple-50 text-purple-600"
          }`}>
          ✨ AI Summary available
        </div>
      )}
    </div>
  );
};

export default NoteCard;
