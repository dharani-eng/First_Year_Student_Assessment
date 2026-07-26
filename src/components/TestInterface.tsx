import React, { useState, useEffect } from 'react';
import { Student, Question } from '../types';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  GraduationCap,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TestInterfaceProps {
  student: Student;
  questions: Question[];
  onSubmitTest: (answers: Record<number, number>, timeSpentSeconds: number) => void;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({
  student,
  questions,
  onSubmitTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState<boolean>(false);

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit when time expires
      onSubmitTest(selectedAnswers, 15 * 60 - timeLeft);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedAnswers, onSubmitTest]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = Math.round((answeredCount / questions.length) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmSubmit = () => {
    const timeSpent = 15 * 60 - timeLeft;
    onSubmitTest(selectedAnswers, timeSpent);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        
        {/* Student Credentials Badge */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-slate-100 truncate">{student.name}</h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                {student.registrationId}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-1 truncate">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span>{student.department}</span>
            </p>
          </div>
        </div>

        {/* Center Progress Stats & Palette Toggle */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            id="btn-toggle-palette"
            onClick={() => setShowQuestionPalette(!showQuestionPalette)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Questions Grid ({answeredCount}/{questions.length})</span>
          </button>

          {/* Timer Display */}
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
            timeLeft < 180 ? 'bg-rose-950/60 border-rose-800 text-rose-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}>
            <Clock className={`h-4 w-4 ${timeLeft < 180 ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Expandable Question Grid Palette */}
      {showQuestionPalette && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
            <span>Question Navigation Palette</span>
            <span className="text-slate-400 font-normal">{answeredCount} of {questions.length} Answered</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {questions.map((q, idx) => {
              const isSelected = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  id={`btn-question-jump-${idx + 1}`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowQuestionPalette(false);
                  }}
                  className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white font-bold'
                      : isSelected
                      ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Single Question Page Container */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative space-y-6">
        
        {/* Question Header & Section Tag */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              {currentQuestion.section}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed pt-1">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Multiple Choice Options List */}
        <div className="space-y-3 py-2">
          {currentQuestion.options.map((option, optionIdx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === optionIdx;
            const optionLabels = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={optionIdx}
                id={`option-card-${optionIdx}`}
                onClick={() => handleSelectOption(optionIdx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-3.5 group cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-950/50 text-indigo-100'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                }`}
              >
                {/* Option Letter Icon */}
                <div
                  className={`h-8 w-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                  }`}
                >
                  {optionLabels[optionIdx]}
                </div>

                {/* Option Text */}
                <span className="text-sm font-medium leading-relaxed flex-1">{option}</span>

                {/* Checked Badge */}
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation Control Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          
          {/* Previous Button */}
          <button
            id="btn-previous-question"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isFirstQuestion
                ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Question Counter Dots */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-indigo-500'
                    : selectedAnswers[q.id] !== undefined
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Next OR Submit Test Button */}
          {isLastQuestion ? (
            <button
              id="btn-submit-test-last"
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Submit Test</span>
            </button>
          ) : (
            <button
              id="btn-next-question"
              onClick={handleNext}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-emerald-400">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-100">Confirm Test Submission</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of <strong className="text-slate-100">{questions.length}</strong> questions.
              Are you sure you want to finish and submit your test now?
            </p>

            {answeredCount < questions.length && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-300">
                ⚠️ Notice: You still have {questions.length - answeredCount} unanswered questions.
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                id="btn-cancel-modal"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Return to Test
              </button>
              <button
                id="btn-confirm-submit-modal"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
