import { Preferences } from '../../shared/types';

interface PreferencesPanelProps {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
}

export default function PreferencesPanel({ preferences, onChange }: PreferencesPanelProps) {
  const handleChange = (field: keyof Preferences, value: number) => {
    onChange({ ...preferences, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Day Start Hour</label>
        <input
          type="number"
          value={preferences.dayStartHour}
          onChange={(e) => handleChange('dayStartHour', Number(e.target.value))}
          min="0"
          max="23"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Hour when your day starts (0-23)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Day End Hour</label>
        <input
          type="number"
          value={preferences.dayEndHour}
          onChange={(e) => handleChange('dayEndHour', Number(e.target.value))}
          min="0"
          max="23"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Hour when your day ends (0-23)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Slot Step (minutes)</label>
        <select
          value={preferences.slotStepMin}
          onChange={(e) => handleChange('slotStepMin', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Granularity for scheduling</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (minutes)</label>
        <input
          type="number"
          value={preferences.bufferMin}
          onChange={(e) => handleChange('bufferMin', Number(e.target.value))}
          min="0"
          step="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Break time between tasks</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Heavy Tasks Per Day</label>
        <input
          type="number"
          value={preferences.maxHeavyPerDay}
          onChange={(e) => handleChange('maxHeavyPerDay', Number(e.target.value))}
          min="1"
          max="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Limit on demanding tasks per day</p>
      </div>
    </div>
  );
}
