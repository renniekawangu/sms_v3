import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { examApi, subjectsApi, classroomApi } from '../services/api';

export default function ExamForm({ isOpen, onClose, onSuccess, exam = null }) {
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '',
    term: '',
    examType: 'unit-test',
    subjects: [],
    classrooms: [],
    totalMarks: 100,
    passingMarks: 40,
    description: '',
  });
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch subjects
        const subjectsRes = await subjectsApi.list();
        setSubjects(subjectsRes || []);
        
        // Fetch classrooms
        const classroomsRes = await classroomApi.list();
        // classroomApi returns an array directly
        const classroomsArray = Array.isArray(classroomsRes) ? classroomsRes : (classroomsRes.classrooms || []);
        setClassrooms(classroomsArray);
        
        // Generate available academic years (current and next 2 years)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 3; i++) {
          const year = currentYear + i;
          years.push(`${year}`);
        }
        setAcademicYears(years);
        
        // If editing an exam, populate form
        if (exam) {
          setFormData({
            name: exam.name || '',
            academicYear: exam.academicYear || '',
            term: exam.term || '',
            examType: exam.examType || 'unit-test',
            subjects: exam.subjects?.map(s => s._id || s) || [],
            classrooms: exam.classrooms?.map(c => c._id || c) || [],
            totalMarks: exam.totalMarks || 100,
            passingMarks: exam.passingMarks || 40,
            description: exam.description || '',
          });
        } else {
          // Set default academic year for new exams
          setFormData(prev => ({
            ...prev,
            academicYear: `${currentYear}`,
          }));
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (isOpen) {
      fetchData();
    }
    setError('');
  }, [exam, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    
    if ((name === 'subjects' || name === 'classrooms') && type === 'select-multiple') {
      // Handle multiple select for subjects and classrooms
      const selectedValues = Array.from(selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.term || !formData.academicYear) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Transform form data to match backend API
      const payload = {
        name: formData.name,
        academicYear: formData.academicYear,
        term: formData.term,
        examType: formData.examType,
        subjects: formData.subjects,
        classrooms: formData.classrooms,
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        description: formData.description,
      };

      if (exam?._id) {
        await examApi.update(exam._id, payload);
      } else {
        await examApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.join(', ')
        : err.response?.data?.error || err.response?.data?.message || 'Failed to save exam';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {exam ? 'Edit Exam' : 'Create New Exam'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading || dataLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {dataLoading ? (
            <div className="text-center py-4">Loading form data...</div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics Mid-Term"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Academic Year - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term *
                  </label>
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select term</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type *
                  </label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unit-test">Unit Test</option>
                    <option value="midterm">Midterm</option>
                    <option value="endterm">Endterm</option>
                    <option value="final">Final</option>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="formative">Formative</option>
                  </select>
                </div>

                {/* Subjects - Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjects *
                  </label>
                  <select
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleChange}
                    multiple
                    required
                    size={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              {/* Classrooms - Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classrooms
                </label>
                <select
                  name="classrooms"
                  value={formData.classrooms}
                  onChange={handleChange}
                  multiple
                  size={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classrooms.map(classroom => (
                    <option key={classroom._id} value={classroom._id}>
                      {classroom.grade} - {classroom.section}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple (optional)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Total Marks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Passing Marks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add exam description..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || dataLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || dataLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

