import { Preferences } from '../../shared/types';

interface PreferencesPanelProps {
    preferences: Preferences;
    onChange: (preferences: Preferences) => void;
}

export default function PreferencesPanel({ preferences, onChange }: PreferencesPanelProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weather Unit</label>
                <select
                    value={preferences.weatherUnit || 'fahrenheit'}
                    onChange={(e) => onChange({ ...preferences, weatherUnit: e.target.value as 'celsius' | 'fahrenheit' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="celsius">Celsius (°C)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Preferred temperature unit</p>
            </div>
        </div>
    );
}
