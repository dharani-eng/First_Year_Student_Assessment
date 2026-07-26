import React, { useState } from 'react';
import { AppStage, Student, TestResult, SectionResult } from './types';
import { QUESTIONS_DATA } from './data/questionsData';
import { StudentEntry } from './components/StudentEntry';
import { TestInterface } from './components/TestInterface';
import { ResultsAnalysis } from './components/ResultsAnalysis';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<AppStage>('entry');
  const [student, setStudent] = useState<Student | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Stage 1 -> Stage 2: Start Examination
  const handleStartTest = (studentData: Student) => {
    setStudent(studentData);
    setStage('test');
  };

  // Stage 2 -> Stage 3: Submit Examination & Calculate Analytics
  const handleSubmitTest = (
    answers: Record<number, number>,
    timeSpentSeconds: number
  ) => {
    if (!student) return;

    // Calculate Section Breakdown
    const sectionNames = Array.from(
      new Set(QUESTIONS_DATA.map((q) => q.section))
    );

    let totalCorrect = 0;

    const sectionResults: SectionResult[] = sectionNames.map((secName) => {
      const secQuestions = QUESTIONS_DATA.filter((q) => q.section === secName);
      const secTotal = secQuestions.length;
      let secCorrect = 0;

      secQuestions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          secCorrect++;
          totalCorrect++;
        }
      });

      const pct = secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0;
      
      let grade: SectionResult['grade'] = 'F';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B';
      else if (pct >= 60) grade = 'C';
      else if (pct >= 50) grade = 'D';

      let status: SectionResult['status'] = 'Critical Review';
      if (pct >= 80) status = 'Mastery';
      else if (pct >= 65) status = 'Proficient';
      else if (pct >= 50) status = 'Needs Improvement';

      return {
        section: secName,
        totalQuestions: secTotal,
        correctCount: secCorrect,
        scorePercentage: pct,
        grade,
        status,
      };
    });

    const overallPct = Math.round((totalCorrect / QUESTIONS_DATA.length) * 100);
    let overallGrade = 'F';
    if (overallPct >= 90) overallGrade = 'A+';
    else if (overallPct >= 80) overallGrade = 'A';
    else if (overallPct >= 70) overallGrade = 'B';
    else if (overallPct >= 60) overallGrade = 'C';
    else if (overallPct >= 50) overallGrade = 'D';

    const resultObj: TestResult = {
      student,
      totalQuestions: QUESTIONS_DATA.length,
      correctCount: totalCorrect,
      scorePercentage: overallPct,
      overallGrade,
      timeSpentSeconds,
      sectionResults,
      answers,
    };

    setTestResult(resultObj);
    setStage('results');
  };

  // Exit & Reset Application
  const handleExitApplication = () => {
    setStudent(null);
    setTestResult(null);
    setStage('entry');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
              EduInsight
            </h1>
            <p className="text-[11px] text-indigo-300 font-medium">Measure. Analyze. Improve.</p>
          </div>
        </div>

        {/* Navigation Step Indicators */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-lg transition-colors ${stage === 'entry' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
            1. Registration
          </span>
          <span className="text-slate-700">•</span>
          <span className={`px-2.5 py-1 rounded-lg transition-colors ${stage === 'test' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
            2. Examination
          </span>
          <span className="text-slate-700">•</span>
          <span className={`px-2.5 py-1 rounded-lg transition-colors ${stage === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
            3. Analysis & PDF Report
          </span>
        </div>
      </header>

      {/* Dynamic Stage Render */}
      <main className="flex-1 py-6 px-2 sm:px-4">
        {stage === 'entry' && <StudentEntry onStartTest={handleStartTest} />}
        {stage === 'test' && student && (
          <TestInterface
            student={student}
            questions={QUESTIONS_DATA}
            onSubmitTest={handleSubmitTest}
          />
        )}
        {stage === 'results' && testResult && (
          <ResultsAnalysis
            testResult={testResult}
            questions={QUESTIONS_DATA}
            onExitApplication={handleExitApplication}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3.5 px-6 text-center text-xs text-slate-500">
        EduInsight • Measure. Analyze. Improve.
      </footer>
    </div>
  );
}
