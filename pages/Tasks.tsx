import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon, List, LayoutGrid, Clock, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { ALL_TASKS } from '../constants';
import { Task, TaskStatus } from '../types';

const Tasks = () => {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [tasks, setTasks] = useState<Task[]>(ALL_TASKS);
  const [filter, setFilter] = useState('');

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    const id = e.dataTransfer.getData('taskId');
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(filter.toLowerCase()) || 
    t.description?.toLowerCase().includes(filter.toLowerCase())
  );

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900';
      case 'medium': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      case 'low': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const KanbanColumn = ({ title, status, count }: { title: string, status: TaskStatus, count: number }) => (
    <div 
      className="flex-1 min-w-[300px] flex flex-col h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
          <span className="bg-white/50 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">{count}</span>
        </div>
        <button 
          onClick={() => alert(`Adding task to ${title}...`)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 rounded-3xl bg-white/20 dark:bg-slate-900/20 border border-white/30 dark:border-white/5 p-4 space-y-3 overflow-y-auto">
        {filteredTasks.filter(t => t.status === status).map(task => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className="glass-panel p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-brand-300 dark:hover:border-brand-500 transition-all group animate-slide-up"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{task.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-brand-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-600">AM</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                {task.dueDate}
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.filter(t => t.status === status).length === 0 && (
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
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">Task Board</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your projects and daily to-dos.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white/40 dark:bg-slate-800/40 rounded-xl p-1 border border-white/50 dark:border-slate-700/50 backdrop-blur-md">
            <button 
              onClick={() => setView('board')}
              className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
               onClick={() => setView('list')}
               className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => alert('Opening Create Task Modal...')}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-95"
          >
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
             className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-200 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium glass-input"
           />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* View Content */}
      {view === 'board' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-[1000px]">
            <KanbanColumn title="To Do" status="todo" count={filteredTasks.filter(t => t.status === 'todo').length} />
            <KanbanColumn title="In Progress" status="in-progress" count={filteredTasks.filter(t => t.status === 'in-progress').length} />
            <KanbanColumn title="Completed" status="completed" count={filteredTasks.filter(t => t.status === 'completed').length} />
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Task Name</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Due Date</th>
                  <th className="text-right py-4 px-6 text-sm font-bold text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${task.status === 'completed' ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600'}`}>
                           {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                         </div>
                         <div>
                           <p className="font-bold text-slate-800 dark:text-slate-200">{task.title}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{task.description}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        task.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <CalendarIcon className="w-4 h-4" />
                        {task.dueDate}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
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
    </div>
  );
};

export default Tasks;