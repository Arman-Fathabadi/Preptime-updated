import { Preferences } from '../../shared/types';

interface PreferencesPanelProps {
    preferences: Preferences;
    onChange: (preferences: Preferences) => void;
    isDark: boolean;
}

export default function PreferencesPanel({ preferences, onChange, isDark }: PreferencesPanelProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Weather Unit
                </label>
                <select
                    value={preferences.weatherUnit || 'celsius'}
                    onChange={(e) => onChange({ ...preferences, weatherUnit: e.target.value as 'celsius' | 'fahrenheit' })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-slate-900'
                        }`}
                >
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="celsius">Celsius (°C)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Preferred temperature unit</p>
            </div>
        </div>
    );
}
