export type AppStage = 'entry' | 'test' | 'results';

export interface Student {
  name: string;
  department: string;
  dateOfBirth: string;
  registrationId?: string;
  startTime?: string;
  endTime?: string;
}

export interface Question {
  id: number;
  section: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export interface SectionResult {
  section: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'Mastery' | 'Proficient' | 'Needs Improvement' | 'Critical Review';
}

export interface TestResult {
  student: Student;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  overallGrade: string;
  timeSpentSeconds: number;
  sectionResults: SectionResult[];
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  aiAnalysis?: string;
}
