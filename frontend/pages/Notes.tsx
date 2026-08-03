import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import NotesTab from '../components/notes/NotesTab';
import { Task, ExtractedTask } from '../types';

export const Notes: React.FC = () => {
  const { theme } = useOutletContext<{ theme: string }>();
  const { notes, tasks, addNote, updateNote, deleteNote, pinNote, addTask } =
    useData();

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
          AI-Powered Smart Notes
        </h1>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
          Capture thoughts, extract action items into tasks, and pin key operational notes
        </p>
      </div>

      <NotesTab
        notes={notes}
        tasks={tasks}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onPinNote={pinNote}
        onCreateTask={(extractedTask: ExtractedTask) => {
          const task: Task = {
            id: crypto.randomUUID(),
            title: extractedTask.title,
            description: '',
            status: 'todo',
            priority: extractedTask.priority || 'medium',
            dueDate: extractedTask.dueDate || '',
            recurring: false,
            tags: [],
            category: 'Personal',
          };
          addTask(task);
        }}
        theme={theme}
      />
    </div>
  );
};

export default Notes;
