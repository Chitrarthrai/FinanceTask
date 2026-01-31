import React from "react";
import { useOutletContext } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import NotesTab from "../components/notes/NotesTab";
import { Task, ExtractedTask, Note } from "../types";

const Notes = () => {
  const { theme } = useOutletContext<{ theme: string }>();
  const { notes, tasks, addNote, updateNote, deleteNote, pinNote, addTask } =
    useData();

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col pb-6 animate-fade-in">
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
            description: "",
            status: "todo",
            priority: extractedTask.priority || "medium",
            dueDate: extractedTask.dueDate || "",
            recurring: false,
            tags: [],
            category: "Personal",
          };
          addTask(task);
        }}
        theme={theme}
      />
    </div>
  );
};

export default Notes;
