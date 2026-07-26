import React, { useEffect, useState, useRef } from 'react';
import { TestResult, SectionResult, Question } from '../types';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  HelpCircle,
  User,
  GraduationCap,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  LogOut
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { callGeminiApi } from '../utils/aiHelper';

interface ResultsAnalysisProps {
  testResult: TestResult;
  questions: Question[];
  onExitApplication: () => void;
}

const COLORS = ['#10b981', '#f43f5e', '#64748b'];

const cleanFormattingSymbols = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s?/g, '')
    .replace(/`/g, '')
    .replace(/_{1,2}/g, '')
    .trim();
};

export const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({
  testResult,
  questions,
  onExitApplication,
}) => {
  const [aiDiagnostic, setAiDiagnostic] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      // Ignore if web environment restricts
    }
  }, []);

  // Generate Gemini AI Diagnostic Report
  useEffect(() => {
    async function fetchAiDiagnostic() {
      setLoadingAi(true);
      try {
        const sectionSummary = testResult.sectionResults
          .map((s) => `${s.section}: ${s.correctCount}/${s.totalQuestions} (${s.scorePercentage}%) - Grade ${s.grade}`)
          .join('\n');
    const detailedAnswerSummary = testResult.answers
  .map((answer, index) => {
    const question = answer.question;

    return `
Question ${index + 1}

Section:
${question.section}

Question:
${question.question}

Options:
${question.options
  .map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`)
  .join("\n")}

Student Selected:
${question.options[answer.selectedAnswer]}

Correct Answer:
${question.options[question.correctAnswer]}

Result:
${answer.selectedAnswer === question.correctAnswer ? "Correct" : "Incorrect"}

Explanation:
${question.explanation}
`;
  })
  .join("\n--------------------------------------------------\n");
        const prompt = `You are an Educational Psychologist, Student Counsellor, Psychometric Assessment Specialist, Career Guidance Expert, Computer Science Professor, and Academic Mentor.

Your responsibility is to analyse the assessment for educational counselling purposes only.

This is NOT a psychological diagnosis.

Never mention disorders, diseases, depression, anxiety, or clinical conditions.

Student Information

Student Name:
${student.name}

Programme:
Five Year Integrated M.Sc Computing

Overall Score:
${testResult.correctCount}/${testResult.totalQuestions}

Overall Percentage:
${testResult.scorePercentage}%

Overall Grade:
${testResult.overallGrade}

Section-wise Performance

${sectionSummary}
Detailed Question Analysis

${detailedAnswerSummary}
Generate a highly professional counselling report.

The report should contain exactly these headings.

Executive Summary

Cognitive Ability Analysis

Computational Thinking Analysis

Behavioural Traits Analysis

Communication Skills Analysis

Personality Profile

Learning Behaviour

Programming Readiness

Leadership Potential

Research Aptitude

Problem Solving Ability

Innovation & Creativity

Academic Readiness

Major Strengths

Areas for Improvement

Suggested Learning Activities

Faculty Mentor Recommendations

Parent Guidance

Career Path Recommendation

Six Month Improvement Plan

Motivational Note

Instructions

Do not repeat the scores.

Infer the student's strengths from the scores.

Write naturally like an experienced counsellor.

Avoid generic statements.

Every student's report should be unique.

Explain WHY you reached every conclusion.

Provide constructive suggestions.

Length should be around 1000–1500 words.

Do not use Markdown.

Do not use ** or ##.

Write in professional English.

End with an encouraging motivational message. 

Section Breakdown:
${sectionSummary}

Generate a concise, professional, highly encouraging diagnostic analysis report covering:
1. Key Strengths and Mastery Areas: Highlight top-performing subjects.
2. Targeted Areas for Improvement: Specific domains needing review based on lower scores.
3. Personalized Academic Action Plan: 3 actionable, structured study recommendations to excel in future exams.

IMPORTANT FORMATTING RULE: Do NOT use any asterisks (*), hash signs (#), bold markers (**), or backticks anywhere in your text. Write in clean plain text with simple numbers or hyphens.`;

        const res = await callGeminiApi(prompt, 'You are a Senior Educational Psychologist, Student Counsellor, Psychometric Assessment Expert, Career Guidance Specialist, Computing Professor, and Academic Mentor.

Your role is to generate a professional educational counselling report for first-year students admitted to a Five-Year Integrated M.Sc. Computing programme.

Important Instructions:

- This assessment is ONLY for educational guidance.
- Never diagnose mental health conditions.
- Never mention depression, anxiety, disorders, or clinical terminology.
- Base every conclusion on the student's assessment performance.
- Infer learning patterns, computational aptitude, behavioural tendencies, communication ability, and personality characteristics.
- Explain WHY each conclusion is reached.
- Provide constructive and encouraging recommendations.
- Every student's report must be unique.
- Do not simply repeat scores.
- Write in professional English suitable for faculty members, parents, and students.
- End with an encouraging motivational message.

Your report should read as if written by an experienced educational counsellor.');
        setAiDiagnostic(cleanFormattingSymbols(res));
      } catch (err: any) {
        setAiDiagnostic(
          cleanFormattingSymbols(
            `Diagnostic Assessment Summary for ${testResult.student.name}:\n\n- Overall Score: ${testResult.scorePercentage}% (${testResult.overallGrade})\n- Strongest Domain: ${
              [...testResult.sectionResults].sort((a, b) => b.scorePercentage - a.scorePercentage)[0]?.section || 'Core Competencies'
            }\n- Focus Requirement: Review key concepts in areas scoring below 75%.`
          )
        );
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAiDiagnostic();
  }, [testResult]);

  const [pdfStatus, setPdfStatus] = useState<string>('');

  // Native Vector PDF Document Generator with Embedded Chart Canvas
  const generateNativePDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    let currentY = 15;

    // Header Dark Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('EDUINSIGHT • ASSESSMENT & DIAGNOSTIC REPORT', 14, 13);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(199, 210, 254); // indigo-200
    doc.text(`Measure. Analyze. Improve. • Evaluated: ${new Date().toLocaleDateString()}`, 14, 21);

    currentY = 36;

    // Student Bio Card Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(12, currentY, pageWidth - 24, 32, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(testResult.student.name, 16, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Department: ${testResult.student.department}`, 16, currentY + 15);
    doc.text(`Date of Birth: ${testResult.student.dateOfBirth || testResult.student.registrationId}`, 16, currentY + 22);

    const durationMin = Math.floor(testResult.timeSpentSeconds / 60);
    const durationSec = testResult.timeSpentSeconds % 60;
    doc.text(`Time Spent: ${durationMin}m ${durationSec}s`, 16, currentY + 28);

    // Score badge box inside profile card
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.roundedRect(pageWidth - 68, currentY + 4, 52, 24, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`Score: ${testResult.correctCount}/${testResult.totalQuestions}`, pageWidth - 42, currentY + 12, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text(`Grade: ${testResult.overallGrade} (${testResult.scorePercentage}%)`, pageWidth - 42, currentY + 20, { align: 'center' });

    currentY += 38;

    // 1. Section-Wise Breakdown Table using autoTable
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Section-Wise Performance Breakdown', 14, currentY);
    currentY += 4;

    const sectionRows = testResult.sectionResults.map((sec) => [
      sec.section,
      `${sec.correctCount} / ${sec.totalQuestions}`,
      `${sec.scorePercentage}%`,
      sec.grade,
      sec.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Section Domain', 'Correct Score', 'Percentage', 'Grade', 'Mastery Status']],
      body: sectionRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold' },
        4: { halign: 'center' },
      },
      margin: { left: 12, right: 12 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // 2. Sectional Performance Metrics & Proficiency Radar Map Vector Graphs
    if (currentY + 70 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Interactive Performance Analytics & Graphs', 14, currentY);
    currentY += 6;

    const chartCardWidth = 88;
    const chartCardHeight = 60;
    const leftChartX = 14;
    const rightChartX = 108;

    // --- LEFT CARD: Sectional Performance Metrics (Bar Chart) ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.setDrawColor(51, 65, 85); // slate-700
    doc.roundedRect(leftChartX, currentY, chartCardWidth, chartCardHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Sectional Performance Metrics', leftChartX + 5, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(199, 210, 254);
    doc.text('Score vs Max Questions', leftChartX + chartCardWidth - 5, currentY + 7, { align: 'right' });

    // Bar Chart Axes & Bars
    const barAreaX = leftChartX + 8;
    const barAreaY = currentY + 14;
    const barAreaWidth = chartCardWidth - 12;
    const barAreaHeight = chartCardHeight - 22;

    // Background horizontal grid lines
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.2);
    for (let g = 0; g <= 4; g++) {
      const gy = barAreaY + (barAreaHeight / 4) * g;
      doc.line(barAreaX, gy, barAreaX + barAreaWidth, gy);
    }

    const sectionCount = testResult.sectionResults.length;
    const colSlotWidth = barAreaWidth / Math.max(1, sectionCount);

    testResult.sectionResults.forEach((sec, idx) => {
      const slotX = barAreaX + colSlotWidth * idx + colSlotWidth / 2;
      const maxQ = Math.max(1, sec.totalQuestions);
      const scoreRatio = sec.correctCount / maxQ;

      const barW = Math.min(9, colSlotWidth * 0.35);

      // Max Questions Bar (Gray background bar)
      const maxBarH = barAreaHeight - 5;
      doc.setFillColor(51, 65, 85);
      doc.roundedRect(slotX - barW - 0.5, barAreaY + (barAreaHeight - maxBarH), barW, maxBarH, 1, 1, 'F');

      // Score Bar (Indigo foreground bar)
      const scoreBarH = maxBarH * scoreRatio;
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(slotX + 0.5, barAreaY + (barAreaHeight - scoreBarH), barW, Math.max(1, scoreBarH), 1, 1, 'F');

      // Score text on top
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 232, 240);
      doc.text(`${sec.correctCount}/${sec.totalQuestions}`, slotX, barAreaY + (barAreaHeight - scoreBarH) - 1.5, { align: 'center' });

      // Label below X-axis
      let shortLabel = sec.section
        .replace('Cognitive Ability', 'Cognitive')
        .replace('Behavioral Traits', 'Behavioral')
        .replace('Personality Profile', 'Personality')
        .replace('Data Structures & Algorithms', 'DSA')
        .replace('Logical & Analytical Thinking', 'Logical')
        .replace('Technical & System Concepts', 'Tech')
        .replace('Quantitative Reasoning', 'Quant');
      if (shortLabel.length > 11) shortLabel = shortLabel.substring(0, 10) + '..';

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(shortLabel, slotX, barAreaY + barAreaHeight + 4, { align: 'center' });
    });


    // --- RIGHT CARD: Proficiency Radar Map ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.setDrawColor(51, 65, 85); // slate-700
    doc.roundedRect(rightChartX, currentY, chartCardWidth, chartCardHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Proficiency Radar Map', rightChartX + 5, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(167, 243, 208);
    doc.text('Domain Scale %', rightChartX + chartCardWidth - 5, currentY + 7, { align: 'right' });

    // Radar Geometry
    const radarCx = rightChartX + chartCardWidth / 2;
    const radarCy = currentY + 34;
    const radarR = 17;

    // Draw 4 concentric radar web rings (25%, 50%, 75%, 100%)
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    [0.25, 0.5, 0.75, 1.0].forEach((ring) => {
      const ringR = radarR * ring;
      const ringPts: { x: number; y: number }[] = [];
      for (let i = 0; i < sectionCount; i++) {
        const angle = (2 * Math.PI * i) / sectionCount - Math.PI / 2;
        ringPts.push({
          x: radarCx + ringR * Math.cos(angle),
          y: radarCy + ringR * Math.sin(angle),
        });
      }
      for (let i = 0; i < ringPts.length; i++) {
        const nextIdx = (i + 1) % ringPts.length;
        doc.line(ringPts[i].x, ringPts[i].y, ringPts[nextIdx].x, ringPts[nextIdx].y);
      }
    });

    // Draw spokes and section axis text
    const dataPts: { x: number; y: number; pct: number; label: string }[] = [];

    for (let i = 0; i < sectionCount; i++) {
      const sec = testResult.sectionResults[i];
      const angle = (2 * Math.PI * i) / sectionCount - Math.PI / 2;
      const outerX = radarCx + radarR * Math.cos(angle);
      const outerY = radarCy + radarR * Math.sin(angle);

      // Spoke line
      doc.setDrawColor(51, 65, 85);
      doc.line(radarCx, radarCy, outerX, outerY);

      // Data vertex location
      const pct = sec.scorePercentage;
      const dataR = radarR * (pct / 100);
      dataPts.push({
        x: radarCx + dataR * Math.cos(angle),
        y: radarCy + dataR * Math.sin(angle),
        pct,
        label: sec.section,
      });

      // Axis label text position
      let labelShort = sec.section
        .replace('Cognitive Ability', 'Cognitive')
        .replace('Behavioral Traits', 'Behavioral')
        .replace('Personality Profile', 'Personality')
        .replace('Data Structures & Algorithms', 'DSA')
        .replace('Logical & Analytical Thinking', 'Logical')
        .replace('Technical & System Concepts', 'Tech')
        .replace('Quantitative Reasoning', 'Quant');
      if (labelShort.length > 10) labelShort = labelShort.substring(0, 9) + '..';

      const labelR = radarR + 4.5;
      const labelX = radarCx + labelR * Math.cos(angle);
      const labelY = radarCy + labelR * Math.sin(angle) + 1;

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(203, 213, 225);
      doc.text(labelShort, labelX, labelY, { align: 'center' });
    }

    // Draw Filled Radar Shape using Triangle Fan
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.setDrawColor(16, 185, 129);
    for (let i = 0; i < dataPts.length; i++) {
      const nextI = (i + 1) % dataPts.length;
      doc.triangle(radarCx, radarCy, dataPts[i].x, dataPts[i].y, dataPts[nextI].x, dataPts[nextI].y, 'F');
    }

    // Draw radar outline and vertex nodes
    for (let i = 0; i < dataPts.length; i++) {
      const nextI = (i + 1) % dataPts.length;
      doc.setDrawColor(52, 211, 153); // emerald-400
      doc.setLineWidth(0.5);
      doc.line(dataPts[i].x, dataPts[i].y, dataPts[nextI].x, dataPts[nextI].y);

      // Vertex node circle
      doc.setFillColor(52, 211, 153);
      doc.circle(dataPts[i].x, dataPts[i].y, 0.8, 'F');
    }

    currentY += chartCardHeight + 10;

    // 3. Assessment & Recommendations
    if (currentY + 35 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Assessment & Recommendations', 14, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const cleanAiText = cleanFormattingSymbols(aiDiagnostic);
    const splitLines = doc.splitTextToSize(cleanAiText, pageWidth - 28);

    for (let i = 0; i < splitLines.length; i++) {
      if (currentY > pageHeight - 18) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(splitLines[i], 14, currentY);
      currentY += 4.5;
    }

    currentY += 8;

    // 4. Detailed Question & Solution Breakdown
    if (currentY + 30 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('4. Detailed Question & Solution Breakdown', 14, currentY);
    currentY += 4;

    const solutionRows = questions.map((q, idx) => {
      const userChoice = testResult.answers[q.id];
      const isCorrect = userChoice === q.correctAnswer;
      const userOptStr = cleanFormattingSymbols(userChoice !== undefined ? q.options[userChoice] : 'Not Answered');
      const correctOptStr = cleanFormattingSymbols(q.options[q.correctAnswer]);
      const cleanExp = cleanFormattingSymbols(q.explanation);
      const cleanQ = cleanFormattingSymbols(q.question);

      return [
        `Q${idx + 1}`,
        `${cleanQ}\n- Your Choice: ${userOptStr}\n- Correct Answer: ${correctOptStr}\n- Explanation: ${cleanExp}`,
        isCorrect ? 'CORRECT' : 'INCORRECT',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Question Details & Explanation', 'Result']],
      body: solutionRows,
      theme: 'plain',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: pageWidth - 56 },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'CORRECT') {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
      },
      margin: { left: 12, right: 12 },
    });

    // Add page numbers footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`EduInsight • Measure. Analyze. Improve. • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    return doc;
  };

  // Handle Direct PDF Export
  const handleDownloadPDF = async () => {
    setIsExportingPdf(true);
    setPdfStatus('Building PDF document...');

    try {
      const doc = await generateNativePDF();
      const safeStudentName = testResult.student.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Student';
      const fileName = `${safeStudentName}_Assessment_Analysis.pdf`;

      // Save PDF via jsPDF
      doc.save(fileName);

      setPdfStatus('PDF Downloaded!');
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Opening print preview dialog...');
      window.print();
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
        setPdfStatus('');
      }, 1200);
    }
  };

  // Handle Open PDF in New Tab
  const handleOpenPDFInNewTab = async () => {
    setIsExportingPdf(true);
    setPdfStatus('Opening PDF viewer...');
    try {
      const doc = await generateNativePDF();
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setPdfStatus('Opened in new tab');
    } catch (err: any) {
      console.error('Error opening PDF:', err);
      window.print();
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
        setPdfStatus('');
      }, 1000);
    }
  };

  // Handle Standard Browser Print
  const handlePrintReport = () => {
    window.print();
  };

  // Prepare Chart Data
  const formatShortSection = (name: string) => {
    return name
      .replace('Cognitive Ability', 'Cognitive')
      .replace('Behavioral Traits', 'Behavioral')
      .replace('Personality Profile', 'Personality')
      .replace('Data Structures & Algorithms', 'DSA')
      .replace('Logical & Analytical Thinking', 'Logical')
      .replace('Technical & System Concepts', 'Technical')
      .replace('Quantitative Reasoning', 'Quant');
  };

  const barChartData = testResult.sectionResults.map((s) => ({
    section: formatShortSection(s.section),
    fullName: s.section,
    Score: s.correctCount,
    Total: s.totalQuestions,
    Percentage: s.scorePercentage,
  }));

  const radarChartData = testResult.sectionResults.map((s) => ({
    section: formatShortSection(s.section),
    Proficiency: s.scorePercentage,
    fullMark: 100,
  }));

  const incorrectCount = testResult.totalQuestions - testResult.correctCount;
  const pieChartData = [
    { name: 'Correct', value: testResult.correctCount },
    { name: 'Incorrect / Unanswered', value: incorrectCount },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>Official Examination Performance Analysis</span>
          </h1>
          <p className="text-xs text-slate-400">Verified diagnostic breakdown and section-wise interactive metrics</p>
        </div>

        <div className="flex flex-wrap items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExportingPdf ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isExportingPdf ? (pdfStatus || 'Generating PDF...') : 'Download Analysis PDF'}</span>
          </button>

          <button
            id="btn-exit-application"
            onClick={onExitApplication}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Finish & Exit</span>
          </button>
        </div>
      </div>

      {/* Main Downloadable Report Container */}
      <div ref={reportRef} id="pdf-report-container" className="space-y-8 bg-slate-950 p-2 sm:p-4 rounded-3xl">
        
        {/* Student Profile & Summary Score Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            
            {/* Student Bio */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                <span>{testResult.student.department}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{testResult.student.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>DOB: {testResult.student.dateOfBirth || testResult.student.registrationId}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Time Spent: {Math.floor(testResult.timeSpentSeconds / 60)}m {testResult.timeSpentSeconds % 60}s</span>
                </span>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-center px-4 border-r border-slate-800">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Overall Score</span>
                <span className="text-3xl font-bold text-indigo-400 font-mono">
                  {testResult.correctCount}/{testResult.totalQuestions}
                </span>
              </div>

              <div className="text-center px-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Percentage</span>
                <span className="text-3xl font-bold text-emerald-400 font-mono">
                  {testResult.scorePercentage}%
                </span>
              </div>

              <div className="text-center pl-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Grade</span>
                <span className="text-2xl font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                  {testResult.overallGrade}
                </span>
              </div>
            </div>
          </div>

          {/* Section Score Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testResult.sectionResults.map((sec) => (
              <div
                key={sec.section}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2"
              >
                <span className="text-[11px] font-semibold text-slate-400 block truncate">{sec.section}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-100 font-mono">
                    {sec.correctCount} / {sec.totalQuestions}
                  </span>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Grade {sec.grade}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      sec.scorePercentage >= 75
                        ? 'bg-emerald-500'
                        : sec.scorePercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sec.scorePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Charts Section (Recharts) */}
        <div id="interactive-charts-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
          
          {/* Section Performance Bar Chart */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Section Performance Metrics</h3>
              </div>
              <span className="text-[11px] text-slate-400">Score vs Section Total</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="section" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Score" fill="#6366f1" radius={[6, 6, 0, 0]} name="Correct Score" />
                  <Bar dataKey="Total" fill="#334155" radius={[6, 6, 0, 0]} name="Max Questions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar & Pie Charts Column */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <PieIcon className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Proficiency Radar Map</h3>
              </div>
              <span className="text-[11px] text-slate-400">Domain Scale %</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="section" stroke="#cbd5e1" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Radar name="Proficiency %" dataKey="Proficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gemini AI Diagnostic Report Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Assessment & Recommendations</h3>
              <p className="text-xs text-slate-400">Automated performance breakdown and individualized improvement recommendations</p>
            </div>
          </div>

          {loadingAi ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400 text-xs">
              <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span>Analyzing student section metrics with Gemini AI...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {aiDiagnostic}
            </div>
          )}
        </div>

        {/* Toggleable Question Solutions Review */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <button
            id="btn-toggle-solutions"
            onClick={() => setShowSolutions(!showSolutions)}
            className="w-full flex items-center justify-between text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Detailed Question-by-Question Solution Review</span>
            </div>
            {showSolutions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSolutions && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              {questions.map((q, idx) => {
                const userChoice = testResult.answers[q.id];
                const isCorrect = userChoice === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border space-y-2 text-xs transition-colors ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">
                        Q{idx + 1}. [{q.section}]
                      </span>
                      {isCorrect ? (
                        <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Incorrect / Unanswered</span>
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-slate-200 text-sm">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold block">Your Answer:</span>
                        <span className={isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                          {userChoice !== undefined ? q.options[userChoice] : 'Not Answered'}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold block">Correct Answer:</span>
                        <span className="text-emerald-400 font-medium">{q.options[q.correctAnswer]}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 italic pt-1 border-t border-slate-800/60 text-[11px]">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
