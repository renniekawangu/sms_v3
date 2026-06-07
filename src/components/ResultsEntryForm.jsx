import React, { useState } from 'react';
import { X } from 'lucide-react';
import { resultApi } from '../services/api';

export default function ResultsEntryForm({ isOpen, onClose, onSuccess, classroomId, examId, results = [] }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (results.length > 0) {
      const initialData = {};
      results.forEach(result => {
        initialData[result._id || result.studentId] = {
          score: result.score || '',
          remarks: result.remarks || '',
        };
      });
      setFormData(initialData);
    }
  }, [results, isOpen]);

  const handleScoreChange = (resultId, value) => {
    setFormData(prev => ({
      ...prev,
      [resultId]: { ...prev[resultId], score: value }
    }));
  };

  const handleRemarksChange = (resultId, value) => {
    setFormData(prev => ({
      ...prev,
      [resultId]: { ...prev[resultId], remarks: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update all results
      for (const result of results) {
        const resultId = result._id || result.studentId;
        const data = formData[resultId];
        if (data?.score !== '') {
          await resultApi.update(result._id, {
            score: parseFloat(data.score),
            remarks: data.remarks,
          });
        }
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save results');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || results.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Enter Grades</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Results Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Score</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const resultId = result._id || result.studentId;
                  const data = formData[resultId] || { score: '', remarks: '' };
                  const studentName = result.student?.firstName && result.student?.lastName 
                    ? `${result.student.firstName} ${result.student.lastName}`
                    : result.studentName || 'Unknown';
                  const studentId = result.student?.studentId || result.studentId || 'N/A';
                  
                  return (
                    <tr key={resultId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        <div>
                          <div className="font-medium">{studentName}</div>
                          <div className="text-xs text-gray-500">ID: {studentId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={data.score}
                          onChange={(e) => handleScoreChange(resultId, e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Score"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={data.remarks}
                          onChange={(e) => handleRemarksChange(resultId, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Remarks..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Grades'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
