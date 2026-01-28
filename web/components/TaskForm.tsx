import { useState } from 'react';
import { Task } from '../../shared/types';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [type, setType] = useState<Task['type']>('study');
  const [energy, setEnergy] = useState<Task['energy']>('med');
  const [priority, setPriority] = useState<Task['priority']>(3);
  const [mode, setMode] = useState<Task['mode']>('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      title: title.trim(),
      durationMin,
      type,
      energy,
      priority,
      mode,
      splittable: true,
    };

    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setDurationMin(60);
    setType('study');
    setEnergy('med');
    setPriority(3);
    setMode('balanced');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Duration (min)</label>
          <input
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            min="15"
            step="15"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Task['priority'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 - Low</option>
            <option value="2">2</option>
            <option value="3">3 - Med</option>
            <option value="4">4</option>
            <option value="5">5 - High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Task['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="study">Study</option>
            <option value="deep">Deep Work</option>
            <option value="admin">Admin</option>
            <option value="relax">Relax</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Energy</label>
          <select
            value={energy}
            onChange={(e) => setEnergy(e.target.value as Task['energy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="med">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Task['mode'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="study">Study</option>
          <option value="lockin">Lock-in</option>
          <option value="relax">Relax</option>
          <option value="balanced">Balanced</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Add Task
      </button>
    </form>
  );
}
