import React, { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Repeat,
  ChevronDown,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { Task, TaskStatus } from "../types";
import Modal from "../components/Modal";
import TaskCalendar from "../components/TaskCalendar";
import CustomDatePicker from "../components/CustomDatePicker";

const Tasks = () => {
  const { theme } = useOutletContext<{ theme: string }>();
  const { tasks, addTask, updateTaskStatus, deleteTask } = useData();
  const [view, setView] = useState<"board" | "list" | "calendar">("board");
  const [filter, setFilter] = useState("");

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setFilter(query);
    }
  }, [searchParams]);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form State
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    recurring: false,
    category: "Personal",
  });

  const TASK_CATEGORIES = [
    "Personal",
    "Work",
    "Health",
    "Finance",
    "Shopping",
    "Learning",
  ];

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    const id = e.dataTransfer.getData("taskId");
    updateTaskStatus(id, status);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      (t.description &&
        t.description.toLowerCase().includes(filter.toLowerCase()));
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    // Format the date nicely if it's an ISO string
    let formattedDate = newTask.dueDate || "No Date";
    if (newTask.dueDate && newTask.dueDate.includes("T")) {
      const d = new Date(newTask.dueDate);
      formattedDate = d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }

    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title || "Untitled",
      description: newTask.description || "",
      priority: newTask.priority as any,
      status: newTask.status as any,
      dueDate: formattedDate,
      recurring: newTask.recurring,
      category: newTask.category,
    });
    setIsAddModalOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      recurring: false,
      category: "Personal",
    });
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return theme === "dark"
          ? "bg-rose-900/40 text-rose-400 border-rose-900"
          : "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"; // Vibrant High
      case "medium":
        return theme === "dark"
          ? "bg-amber-900/40 text-amber-400 border-amber-900"
          : "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"; // Vibrant Medium
      case "low":
        return theme === "dark"
          ? "bg-emerald-900/40 text-emerald-400 border-emerald-900"
          : "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"; // Vibrant Low
      default:
        return theme === "dark"
          ? "bg-slate-800 text-slate-400"
          : "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const KanbanColumn = ({
    title,
    status,
    count,
  }: {
    title: string;
    status: TaskStatus;
    count: number;
  }) => (
    <div
      className="flex-1 min-w-[300px] flex flex-col h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}>
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3
            className={`font-bold ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}>
            {title}
          </h3>
          <span className="badge-strong px-2 py-0.5 rounded-full text-xs font-bold">
            {count}
          </span>
        </div>
        <button
          onClick={() => {
            setNewTask({ ...newTask, status });
            setIsAddModalOpen(true);
          }}
          className={`transition-colors ${
            theme === "dark"
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-600"
          }`}>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div
        className={`flex-1 rounded-3xl p-4 space-y-3 overflow-y-auto border ${
          theme === "dark"
            ? "bg-slate-900/40 border-white/5" // Dark mode slightly stronger
            : "bg-slate-50/80 border-slate-200" // Light mode: stronger bg and border
        }`}>
        {filteredTasks
          .filter((t) => t.status === status)
          .map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
              onClick={() => setSelectedTask(task)}
              className={`glass-panel p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all group animate-slide-up border hover:shadow-lg hover:-translate-y-1 ${
                theme === "dark"
                  ? "border-transparent hover:border-brand-500"
                  : "border-slate-200 hover:border-brand-300 hover:bg-orange-50/50" // Light mode: visible border + tint hover
              }`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityColor(
                      task.priority
                    )}`}>
                    {task.priority}
                  </span>
                  {task.recurring && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border flex items-center gap-1 ${
                        theme === "dark"
                          ? "bg-blue-900/40 text-blue-400 border-blue-900"
                          : "bg-blue-100 text-blue-600 border-blue-200"
                      }`}>
                      <Repeat className="w-3 h-3" /> Daily
                    </span>
                  )}
                  {task.category && task.category !== "Personal" && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        theme === "dark"
                          ? "bg-purple-900/40 text-purple-400 border-purple-900"
                          : "bg-purple-100 text-purple-600 border-purple-200"
                      }`}>
                      {task.category}
                    </span>
                  )}
                </div>
                <button
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                    theme === "dark"
                      ? "hover:bg-slate-800 bg-slate-800/50"
                      : "hover:bg-brand-100 bg-white shadow-sm border border-slate-100" // Light mode: distinct button
                  }`}>
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <h4
                className={`font-bold mb-1 ${
                  theme === "dark" ? "text-slate-200" : "text-slate-800"
                }`}>
                {task.title}
              </h4>
              <p
                className={`text-sm line-clamp-2 mb-3 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>
                {task.description}
              </p>

              <div
                className={`flex items-center justify-between pt-3 border-t ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                <div className="flex -space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full bg-brand-100 border-2 flex items-center justify-center text-[10px] font-bold text-brand-600 ${
                      theme === "dark" ? "border-slate-800" : "border-white"
                    }`}>
                    AM
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${
                    theme === "dark"
                      ? "text-slate-500 bg-slate-900"
                      : "text-slate-500 bg-slate-50"
                  }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {task.dueDate}
                </div>
              </div>
            </div>
          ))}
        {filteredTasks.filter((t) => t.status === status).length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-300/50 dark:border-slate-700/50 rounded-2xl">
            <p className="text-sm font-medium">Drop items here</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">
            Task Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your projects and daily to-dos.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white dark:bg-slate-800/40 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
            <button
              onClick={() => setView("board")}
              className={`p-2 rounded-lg transition-all ${
                view === "board"
                  ? "bg-slate-100 dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Board View">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${
                view === "list"
                  ? "bg-slate-100 dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="List View">
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`p-2 rounded-lg transition-all ${
                view === "calendar"
                  ? "bg-slate-100 dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Calendar View">
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 active:scale-95">
            <Plus className="w-5 h-5" /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            type="text"
            placeholder="Search tasks..."
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-all text-sm font-medium glass-input ${
              theme === "dark"
                ? "bg-slate-800/40 border-slate-700/50 focus:bg-slate-900 text-white"
                : "bg-white border-slate-200 focus:bg-white text-slate-800"
            }`}
          />
        </div>

        {/* Functional Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`appearance-none pl-10 pr-10 py-2.5 border rounded-xl font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
              theme === "dark"
                ? "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`appearance-none pl-10 pr-10 py-2.5 border rounded-xl font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
              theme === "dark"
                ? "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            <option value="all">All Categories</option>
            {TASK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* View Content */}
      {view === "board" && (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-[1000px]">
            <KanbanColumn
              title="To Do"
              status="todo"
              count={filteredTasks.filter((t) => t.status === "todo").length}
            />
            <KanbanColumn
              title="In Progress"
              status="in-progress"
              count={
                filteredTasks.filter((t) => t.status === "in-progress").length
              }
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              count={
                filteredTasks.filter((t) => t.status === "completed").length
              }
            />
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="glass-panel rounded-3xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Task Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Priority
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Due Date
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`border-b transition-colors group cursor-pointer ${
                      theme === "dark"
                        ? "border-white/5 hover:bg-white/5"
                        : "border-white/10 hover:bg-white/30"
                    }`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            task.status === "completed"
                              ? "bg-brand-500 border-brand-500"
                              : theme === "dark"
                              ? "border-slate-600"
                              : "border-slate-300"
                          }`}>
                          {task.status === "completed" && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold ${
                                theme === "dark"
                                  ? "text-slate-200"
                                  : "text-slate-800"
                              }`}>
                              {task.title}
                            </p>
                            {task.recurring && (
                              <Repeat className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                          <p
                            className={`text-xs truncate max-w-[200px] ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          task.status === "completed"
                            ? theme === "dark"
                              ? "bg-emerald-900/30 text-emerald-400"
                              : "bg-emerald-500 text-white"
                            : task.status === "in-progress"
                            ? theme === "dark"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-blue-500 text-white"
                            : theme === "dark"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                        {task.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityColor(
                          task.priority
                        )}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={`flex items-center gap-2 text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        }`}>
                        <CalendarIcon className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span>
                            {task.dueDate.includes("T")
                              ? new Date(task.dueDate).toLocaleDateString()
                              : task.dueDate.split(",")[0]}
                          </span>
                          {task.dueDate.includes("T") && (
                            <div className="flex items-center gap-1 text-xs text-brand-500 font-bold">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                            : "hover:bg-white/50 text-slate-400 hover:text-slate-600"
                        }`}>
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="flex-1">
          <TaskCalendar tasks={tasks} onTaskClick={setSelectedTask} />
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl glass-input font-medium ${
                theme === "dark"
                  ? "bg-slate-800/50 text-white placeholder:text-slate-500 border-slate-700"
                  : "bg-white text-slate-800 placeholder:text-slate-400 border-slate-200"
              }`}
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl glass-input font-medium ${
                theme === "dark"
                  ? "bg-slate-800/50 text-white placeholder:text-slate-500 border-slate-700"
                  : "bg-white text-slate-800 placeholder:text-slate-400 border-slate-200"
              }`}
              placeholder="Description"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, category: cat })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newTask.category === cat
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : theme === "dark"
                      ? "bg-slate-800 text-slate-500 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="relative">
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value as any })
                  }
                  className={`w-full px-4 py-3 rounded-xl glass-input font-medium appearance-none ${
                    theme === "dark"
                      ? "bg-slate-800/50 text-white border-slate-700"
                      : "bg-white text-slate-800 border-slate-200"
                  }`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date & Time
              </label>
              <CustomDatePicker
                includeTime={true}
                value={newTask.dueDate || new Date()}
                onChange={(date) => {
                  setNewTask({ ...newTask, dueDate: date.toISOString() });
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-1">
            <input
              type="checkbox"
              id="recurring"
              checked={newTask.recurring}
              onChange={(e) =>
                setNewTask({ ...newTask, recurring: e.target.checked })
              }
              className={`w-5 h-5 rounded text-brand-500 focus:ring-brand-500 border-gray-300 ${
                theme === "dark"
                  ? "bg-slate-800 border-gray-600"
                  : "bg-white/50"
              }`}
            />
            <label
              htmlFor="recurring"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer select-none">
              <Repeat className="w-4 h-4 text-slate-500" />
              Repeat Daily
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30">
            Create Task
          </button>
        </form>
      </Modal>

      {/* View Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details">
        {selectedTask && (
          <div className="space-y-6">
            {/* Header with Status and Priority */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityColor(
                    selectedTask.priority
                  )}`}>
                  {selectedTask.priority}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedTask.status === "completed"
                      ? "bg-emerald-500 text-white dark:bg-emerald-900/40 dark:text-emerald-400"
                      : selectedTask.status === "in-progress"
                      ? "bg-blue-500 text-white dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                  {selectedTask.status.replace("-", " ")}
                </span>
              </div>
              {selectedTask.recurring && (
                <span className="flex items-center gap-1.5 text-blue-500 text-sm font-bold">
                  <Repeat className="w-4 h-4" /> Daily
                </span>
              )}
            </div>

            {/* Title & Date */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {selectedTask.title}
              </h3>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {selectedTask.dueDate || "No Date"}
                  </span>
                </div>
                {(selectedTask.category ||
                  (selectedTask.tags && selectedTask.tags.length > 0)) && (
                  <div className="flex items-center gap-2">
                    {selectedTask.category && (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <Tag className="w-3 h-3" /> {selectedTask.category}
                      </span>
                    )}
                    {selectedTask.tags &&
                      selectedTask.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-white/50 dark:border-slate-700/50">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTask.description || "No description provided."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleDeleteTask}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
