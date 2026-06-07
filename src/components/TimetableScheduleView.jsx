/**
 * Timetable Schedule View Component
 * Displays weekly timetable in a structured format following the prototype
 */
import { useState, useEffect } from 'react';
import { Clock, User, Book, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TimetableScheduleView({ schedule, subjects = [], onEdit, editable = false }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  if (!schedule || !schedule.timetable) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No timetable schedule available</p>
      </div>
    );
  }

  const { classroomId, timetable, academicYear, term } = schedule;
  
  // Get unique periods across all days
  const allPeriods = new Set();
  timetable.forEach(day => {
    day.periods?.forEach(period => {
      allPeriods.add(period.period);
    });
  });
  const periodNumbers = Array.from(allPeriods).sort((a, b) => a - b);

  // Find period for specific day and period number
  const getPeriod = (dayName, periodNum) => {
    const day = timetable.find(d => d.day === dayName);
    return day?.periods?.find(p => p.period === periodNum);
  };

  // Parse time string "09:00-10:00" to get start and end
  const parseTime = (timeStr) => {
    if (!timeStr) return { start: '', end: '' };
    const [start, end] = timeStr.split('-');
    return { start: start?.trim() || '', end: end?.trim() || '' };
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {classroomId?.name || `Grade ${classroomId?.grade} ${classroomId?.section}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              {academicYear} - {term}
            </p>
          </div>
          {editable && onEdit && (
            <button
              onClick={() => onEdit(schedule)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Schedule
            </button>
          )}
        </div>

        {subjects.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Subjects & Codes
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subj) => (
                <span
                  key={subj.id || subj._id || subj.code || subj.name}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100"
                >
                  <span className="font-semibold">{subj.name}</span>
                  {subj.code && <span className="text-blue-600">({subj.code})</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile View - Day Selector */}
      <div className="md:hidden border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              const currentIndex = DAYS_OF_WEEK.indexOf(selectedDay);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : DAYS_OF_WEEK.length - 1;
              setSelectedDay(DAYS_OF_WEEK[prevIndex]);
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">{selectedDay}</h3>
          <button
            onClick={() => {
              const currentIndex = DAYS_OF_WEEK.indexOf(selectedDay);
              const nextIndex = currentIndex < DAYS_OF_WEEK.length - 1 ? currentIndex + 1 : 0;
              setSelectedDay(DAYS_OF_WEEK[nextIndex]);
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Period List */}
        <div className="space-y-3">
          {periodNumbers.map(periodNum => {
            const period = getPeriod(selectedDay, periodNum);
            if (!period) {
              return (
                <div key={periodNum} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-400">Period {periodNum} - Free</div>
                </div>
              );
            }

            const { start, end } = parseTime(period.time);
            return (
              <div key={periodNum} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Period {period.period}</span>
                  <span className="text-xs text-gray-500">
                    <Clock className="inline-block w-3 h-3 mr-1" />
                    {start} - {end}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  <Book className="inline-block w-4 h-4 mr-1" />
                  {period.subject}
                </div>
                <div className="text-xs text-gray-600">
                  <User className="inline-block w-3 h-3 mr-1" />
                  {period.instructorId?.firstName} {period.instructorId?.lastName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop View - Full Week Grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-24">
                Period
              </th>
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700 w-20">
                Time
              </th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodNumbers.map(periodNum => {
              // Get time from any day that has this period
              let timeStr = '';
              for (const day of timetable) {
                const p = day.periods?.find(p => p.period === periodNum);
                if (p?.time) {
                  timeStr = p.time;
                  break;
                }
              }
              const { start, end } = parseTime(timeStr);

              return (
                <tr key={periodNum} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-center font-medium text-gray-700">
                    {periodNum}
                  </td>
                  <td className="border border-gray-200 p-2 text-xs text-gray-600">
                    <div className="whitespace-nowrap">{start}</div>
                    <div className="whitespace-nowrap">{end}</div>
                  </td>
                  {DAYS_OF_WEEK.map(dayName => {
                    const period = getPeriod(dayName, periodNum);
                    
                    if (!period) {
                      return (
                        <td key={dayName} className="border border-gray-200 p-2 bg-gray-50">
                          <div className="text-center text-xs text-gray-400">-</div>
                        </td>
                      );
                    }

                    return (
                      <td key={dayName} className="border border-gray-200 p-2 bg-blue-50">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {period.subject}
                        </div>
                        <div className="text-xs text-gray-600">
                          {period.instructorId?.firstName} {period.instructorId?.lastName}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
            Scheduled Class
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
            Free Period
          </div>
        </div>
      </div>
    </div>
  );
}

TimetableScheduleView.propTypes = {
  schedule: PropTypes.shape({
    _id: PropTypes.string,
    classroomId: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      grade: PropTypes.number,
      section: PropTypes.string,
    }),
    timetable: PropTypes.arrayOf(
      PropTypes.shape({
        day: PropTypes.string.isRequired,
        periods: PropTypes.arrayOf(
          PropTypes.shape({
            period: PropTypes.number.isRequired,
            subject: PropTypes.string.isRequired,
            instructorId: PropTypes.shape({
              _id: PropTypes.string,
              firstName: PropTypes.string,
              lastName: PropTypes.string,
            }),
            time: PropTypes.string.isRequired,
          })
        ),
      })
    ),
    academicYear: PropTypes.string,
    term: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      _id: PropTypes.string,
      name: PropTypes.string,
      code: PropTypes.string,
      hoursPerWeek: PropTypes.number,
    })
  ),
  onEdit: PropTypes.func,
  editable: PropTypes.bool,
};

export default TimetableScheduleView;
