import { useState } from 'react';
import { Event } from '../../shared/types';

interface EventFormProps {
  onAddEvent: (event: Event) => void;
}

export default function EventForm({ onAddEvent }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [kind, setKind] = useState<Event['kind']>('fixed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !start || !end) return;

    const newEvent: Event = {
      id: `e${Date.now()}`,
      title: title.trim(),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      kind,
    };

    onAddEvent(newEvent);
    
    // Reset form
    setTitle('');
    setStart('');
    setEnd('');
    setKind('fixed');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Start</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">End</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Type</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Event['kind'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fixed">Fixed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Add Event
      </button>
    </form>
  );
}
