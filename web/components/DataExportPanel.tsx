import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { dataCollector } from '../utils/dataCollector';

interface DataExportPanelProps {
  isDark: boolean;
  onClose: () => void;
}

const DataExportPanel: React.FC<DataExportPanelProps> = ({ isDark, onClose }) => {
  const [stats, setStats] = useState(dataCollector.getStats());
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = () => {
    const data = exportFormat === 'json' ? dataCollector.exportData() : dataCollector.exportAsCSV();
    const blob = new Blob([data], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preptime_training_data_${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all collected data? This cannot be undone.')) {
      dataCollector.clearData();
      setStats(dataCollector.getStats());
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl shadow-2xl w-full max-w-2xl ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-indigo-600/20' : 'bg-indigo-100'
              }`}
            >
              <svg
                className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                ML Training Data
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Export your scheduling data to improve AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.totalSessions}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Sessions
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.totalEvents}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Events
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.uniqueLabels.length}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Labels
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatBytes(stats.dataSize)}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Data Size
              </div>
            </div>
          </div>

          {/* Event Breakdown */}
          {stats.totalEvents > 0 && (
            <div
              className={`p-4 rounded-xl ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}
            >
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Event Breakdown
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.eventTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Format */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Export Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat('json')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                  exportFormat === 'json'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-700 text-slate-300'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                  exportFormat === 'csv'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-700 text-slate-300'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-indigo-950/20 border-indigo-800/30 text-indigo-300'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            <div className="flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">How this helps:</p>
                <p className="opacity-90">
                  Your scheduling patterns help train the AI to make better recommendations. All data is stored locally and only exported when you choose.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-600 dark:text-green-400"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Data exported successfully!</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex gap-3 ${
            isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={handleClear}
            disabled={stats.totalEvents === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              stats.totalEvents === 0
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Clear Data
          </button>
          <button
            onClick={handleExport}
            disabled={stats.totalEvents === 0}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              stats.totalEvents === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DataExportPanel;
