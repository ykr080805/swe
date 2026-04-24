import { useState, useEffect } from 'react';
import { getMyAttendance } from '../../services/apiService';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    getMyAttendance().then(r => setAttendance(r.data)).catch(() => {});
  }, []);

  // Group by semester+year for display
  const bySemester = {};
  for (const record of attendance) {
    const co = record.courseOffering;
    const key = `${co?.semester || ''} ${co?.year || ''}`.trim() || 'Current Semester';
    if (!bySemester[key]) bySemester[key] = [];
    bySemester[key].push(record);
  }
  const semesterGroups = Object.entries(bySemester);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Your attendance record across enrolled courses.</p>
      </div>

      {attendance.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No attendance data available yet.</p>
        </div>
      )}

      {semesterGroups.map(([semLabel, records]) => (
        <div key={semLabel}>
          {/* Semester label */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{semLabel}</h2>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{records.length} course{records.length !== 1 ? 's' : ''}</span>
          </div>

          {/* ── Grid: 2 columns on md+, 1 on mobile ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {records.map((record) => {
              const co = record.courseOffering;
              const courseName = co?.course?.name || 'Unknown Course';
              const courseCode = co?.course?.code || '';
              const pct = record.percentage ?? 0;

              const statusColor =
                pct >= 75 ? { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: null } :
                pct >= 60  ? { bar: 'bg-amber-400',  text: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'Low' } :
                             { bar: 'bg-rose-500',   text: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   label: 'Critical' };

              const classesNeeded = pct < 75
                ? Math.max(0, Math.ceil((0.75 * record.total - record.attended) / 0.25))
                : 0;

              return (
                <div
                  key={co?._id || courseName}
                  className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${pct < 60 ? 'border-rose-200' : pct < 75 ? 'border-amber-200' : 'border-gray-200'}`}
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {courseCode && (
                          <span className="text-indigo-600 mr-1.5">{courseCode}</span>
                        )}
                        {courseName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {record.attended} / {record.total} classes
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-2xl font-black leading-none ${statusColor.text}`}>
                        {pct}%
                      </span>
                      {statusColor.label && (
                        <p className={`text-[10px] font-bold mt-0.5 ${statusColor.text}`}>
                          {statusColor.label}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${statusColor.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Warning */}
                  {pct < 75 && (
                    <p className={`text-[11px] font-medium px-3 py-1.5 rounded-lg ${statusColor.bg} ${statusColor.text}`}>
                      {pct < 75 && classesNeeded > 0
                        ? `Attend ${classesNeeded} more class${classesNeeded !== 1 ? 'es' : ''} to reach 75%`
                        : 'You have met the attendance requirement'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
