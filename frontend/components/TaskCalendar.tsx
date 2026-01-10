import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Clock } from "lucide-react";
import { Task } from "../types";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    // Just a dummy logic to match local format "Aug 24" or ISO "2024-08-24"
    // In a real app, strict date parsing is needed.
    // Here we check if the task string contains the day number/month for demo purposes
    // Or if we assume the dummy data format.
    // The current dummy data uses "Aug 24, 2024" or "Today"/"Tomorrow".
    // For this UI demo, I'll filter based on a simplified string match if it contains "Aug {day}" etc.
    // But since the current dummy data is static, I will just force some logic for demo display
    // or try to match nicely.

    // Better Approach for DEMO:
    // Simply check if the 'dueDate' string matches loosely or just show random distribution if data is messy?
    // User asked to "start working on frontend with dummy values".
    // I will try to parse "Month DD" from the current view.

    const dateString = `${monthNames[month].substring(0, 3)} ${day}`;
    return tasks.filter((t) => t.dueDate && t.dueDate.includes(dateString));
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-rose-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl h-full flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold text-sm rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-5 gap-2 md:gap-4 flex-1 min-h-[500px]">
        {blanksArray.map((_, i) => (
          <div
            key={`blank-${i}`}
            className="p-2 min-h-[100px] border border-transparent"
          />
        ))}

        {daysArray.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={`day-${day}`}
              className={`p-2 md:p-3 min-h-[100px] rounded-2xl border transition-all hover:bg-white/40 dark:hover:bg-white/5 flex flex-col gap-2 ${
                isToday
                  ? "bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-900"
                  : "bg-white/20 dark:bg-slate-800/20 border-white/40 dark:border-white/5"
              }`}>
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-brand-500 text-white shadow-brand-500/30 shadow-lg"
                      : "text-slate-700 dark:text-slate-300"
                  }`}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 rounded-md font-bold">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-brand-300 transition-colors group">
                    <div className="flex items-start gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${getPriorityColor(
                          task.priority
                        )}`}
                      />
                      <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCalendar;
