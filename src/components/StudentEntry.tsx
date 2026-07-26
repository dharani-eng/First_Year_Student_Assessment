import React, { useState } from 'react';
import { Student } from '../types';
import { User, GraduationCap, ArrowRight, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

interface StudentEntryProps {
  onStartTest: (student: Student) => void;
}

const DEPARTMENTS = [
  'M.Sc Software Systems',
  'M.Sc Data Science',
  'M.Sc Decision and Computing Sciences',
  'M.Sc Artificial Intelligence and Machine Learning',
];

export const StudentEntry: React.FC<StudentEntryProps> = ({ onStartTest }) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to proceed.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please select your Date of Birth.');
      return;
    }
    setError('');
    onStartTest({
      name: name.trim(),
      department,
      dateOfBirth,
      registrationId: dateOfBirth,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-center shadow-2xl backdrop-blur-xl">
        <div className="mb-6 space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>EduInsight</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Student Portal Registration</h2>
          <p className="text-xs text-slate-400">Please provide your details to generate your personalized test session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center space-x-2 animate-shake">
              <ShieldCheck className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Name */}
          <div className="space-y-1.5">
            <label htmlFor="input-student-name" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Full Name *</span>
            </label>
            <input
              id="input-student-name"
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Department Selection */}
          <div className="space-y-1.5">
            <label htmlFor="select-department" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Academic Department / Branch *</span>
            </label>
            <select
              id="select-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-slate-200">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label htmlFor="input-dob" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Date of Birth *</span>
            </label>
            <input
              id="input-dob"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="btn-start-test"
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all duration-200 active:scale-[0.99] group"
            >
              <span>Proceed to Examination</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
