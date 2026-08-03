import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Task, TaskStatus } from '../types';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import TaskCalendar from '../components/TaskCalendar';
import CustomDatePicker from '../components/CustomDatePicker';

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useData();
  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');
  const [filter, setFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => new Date());

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setFilter(query);
    }
  }, [searchParams]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notDoneTaskId, setNotDoneTaskId] = useState<string | null>(null);
  const [reasonNotDoneInput, setReasonNotDoneInput] = useState('');

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    recurring: false,
    category: 'Personal',
  });

  const TASK_CATEGORIES = [
    'Personal',
    'Work',
    'Health',
    'Finance',
    'Shopping',
    'Learning',
  ];

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    const id = e.dataTransfer.getData('taskId');
    if (status === 'not-done') {
      setNotDoneTaskId(id);
      setReasonNotDoneInput('');
    } else {
      updateTaskStatus(id, status);
    }
  };

  const handleConfirmNotDone = () => {
    if (notDoneTaskId) {
      updateTaskStatus(notDoneTaskId, 'not-done', reasonNotDoneInput);
      setNotDoneTaskId(null);
      setReasonNotDoneInput('');
    }
  };

  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(filter.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(filter.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      let matchesDate = true;
      if (t.dueDate) {
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (taskDate < start) matchesDate = false;
        }

        if (matchesDate && endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (taskDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesPriority && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedDate = newTask.dueDate || 'No Date';
    if (newTask.dueDate && newTask.dueDate.includes('T')) {
      const d = new Date(newTask.dueDate);
      formattedDate = d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    addTask({
      id: crypto.randomUUID(),
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      priority: (newTask.priority as any) || 'medium',
      status: (newTask.status as any) || 'todo',
      dueDate: formattedDate,
      recurring: newTask.recurring,
      category: newTask.category || 'Personal',
    });

    setIsAddModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      recurring: false,
      category: 'Personal',
    });
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
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
      className="flex-1 min-w-[280px] flex flex-col h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm font-display text-[var(--text-primary)]">
            {title}
          </h3>
          <Badge variant="neutral" size="sm">
            {count}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setNewTask({ ...newTask, status });
            setIsAddModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 text-[var(--accent-primary)]" />
        </Button>
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-3 space-y-3 overflow-y-auto min-h-[420px]">
        {filteredTasks
          .filter((t) => t.status === status)
          .map((task) => (
            <Card
              key={task.id}
              variant="rim"
              hoverable
              glowColor={task.priority === 'high' ? 'cyan' : 'none'}
              padding="sm"
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
              onClick={() => setSelectedTask(task)}
              className="cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant={
                      task.priority === 'high'
                        ? 'danger'
                        : task.priority === 'medium'
                        ? 'warning'
                        : 'cyan'
                    }
                    size="sm"
                    pulse={task.priority === 'high'}
                  >
                    {task.priority}
                  </Badge>

                  {task.recurring && (
                    <Badge variant="violet" size="sm">
                      <Repeat className="w-3 h-3 mr-0.5" /> Daily
                    </Badge>
                  )}

                  {task.category && task.category !== 'Personal' && (
                    <Badge variant="neutral" size="sm">
                      {task.category}
                    </Badge>
                  )}
                </div>

                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}

              {task.reasonNotDone && (
                <div className="mb-3 p-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[11px] text-[var(--danger)]">
                  <strong>Reason:</strong> {task.reasonNotDone}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-rim)] text-[11px] text-[var(--text-muted)] font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.dueDate}
                </span>
              </div>
            </Card>
          ))}

        {filteredTasks.filter((t) => t.status === status).length === 0 && (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-[var(--border-rim)] rounded-xl text-xs font-mono text-[var(--text-muted)]">
            Drop task here
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Bar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            Task Operations Kanban
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
            Agile task board, priority tracking, and rescheduling calendar
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Switcher */}
          <div className="flex p-1 rounded-xl glass-panel">
            <button
              onClick={() => setView('board')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                view === 'board'
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                view === 'list'
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                view === 'calendar'
                  ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Calendar View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </section>

      {/* Filters Bar */}
      <Card variant="glass" className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search tasks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
            className="py-1.5 text-xs"
          />
        </div>

        <div className="w-36">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
            className="py-1.5 text-xs"
          />
        </div>

        <div className="w-36">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...TASK_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
            className="py-1.5 text-xs"
          />
        </div>

        {(filter || priorityFilter !== 'all' || categoryFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter('');
              setPriorityFilter('all');
              setCategoryFilter('all');
            }}
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
        )}
      </Card>

      {/* View Content */}
      {view === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1000px]">
            <KanbanColumn
              title="To Do"
              status="todo"
              count={filteredTasks.filter((t) => t.status === 'todo').length}
            />
            <KanbanColumn
              title="In Progress"
              status="in-progress"
              count={filteredTasks.filter((t) => t.status === 'in-progress').length}
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              count={filteredTasks.filter((t) => t.status === 'completed').length}
            />
            <KanbanColumn
              title="Not Done"
              status="not-done"
              count={filteredTasks.filter((t) => t.status === 'not-done').length}
            />
          </div>
        </div>
      )}

      {view === 'list' && (
        <Card variant="glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-rim)] text-[var(--text-muted)] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-rim)]">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-[var(--surface-l2)] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {task.title}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          task.status === 'completed'
                            ? 'success'
                            : task.status === 'in-progress'
                            ? 'cyan'
                            : task.status === 'not-done'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'danger'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'cyan'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {task.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)}>
                        <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === 'calendar' && (
        <Card variant="glass">
          <TaskCalendar tasks={tasks} onTaskClick={setSelectedTask} />
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
        subtitle="Create an action item for your project backlog"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Title"
            required
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task description title"
          />

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-xs placeholder-[var(--text-muted)]"
              rows={3}
              placeholder="Task instructions or notes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
              ]}
            />

            <Select
              label="Category"
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Due Date & Time
            </label>
            <CustomDatePicker
              includeTime={true}
              value={newTask.dueDate || new Date()}
              onChange={(date) => setNewTask({ ...newTask, dueDate: date.toISOString() })}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Create Task
          </Button>
        </form>
      </Modal>

      {/* Reason for Not Done Modal */}
      <Modal
        isOpen={!!notDoneTaskId}
        onClose={() => setNotDoneTaskId(null)}
        title="Reason for Not Done"
        subtitle="Explain why this task was abandoned or left incomplete"
      >
        <div className="space-y-4">
          <textarea
            value={reasonNotDoneInput}
            onChange={(e) => setReasonNotDoneInput(e.target.value)}
            placeholder="Provide a reason (e.g. Low priority, blocked by dependency)..."
            className="w-full glass-input rounded-xl p-3 text-xs"
            rows={3}
          />
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={handleConfirmNotDone}>
              Confirm Not Done
            </Button>
            <Button variant="glass" onClick={() => setNotDoneTaskId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Specifications"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedTask.priority === 'high' ? 'danger' : 'warning'}>
                {selectedTask.priority}
              </Badge>
              <Badge variant="cyan">{selectedTask.status.replace('-', ' ')}</Badge>
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
                {selectedTask.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                Due: {selectedTask.dueDate || 'No Date'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-xs text-[var(--text-secondary)]">
              {selectedTask.description || 'No description provided.'}
            </div>

            {selectedTask.reasonNotDone && (
              <div className="p-3 rounded-xl bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-xs text-[var(--danger)]">
                <strong>Reason Not Done:</strong> {selectedTask.reasonNotDone}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="danger" size="sm" onClick={handleDeleteTask} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                Delete
              </Button>
              <Button variant="glass" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
