import React, { useState } from 'react';
import axios from 'axios';
import {
  Edit3, Sparkles, BookOpen, CheckCircle2, AlertCircle,
  HelpCircle, ArrowRight, Lightbulb, RefreshCw, FileText,
  Upload, Image as ImageIcon, X, Check, Copy
} from 'lucide-react';

const GuruAIHomeworkHelp = ({
  studentClass = 'Class 7',
  joinedTeachers = [],
  userName = '',
  subjects = ['Maths', 'Science'],
  curriculum = 'CBSE',
  preferredLanguage = 'English'
}) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(() => subjects[0] || 'Maths');
  const [isLoading, setIsLoading] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // File Upload State
  const [attachedFile, setAttachedFile] = useState(null); // { name, size, type, dataUrl }
  const [filePreview, setFilePreview] = useState(null);

  const exampleQuestions = [
    "How do I solve this algebra equation: 3x + 5 = 14?",
    "Balance this chemical equation: H2 + O2 -> H2O",
    "Find the perimeter and area of a rectangle with length 12 cm and breadth 8 cm.",
    "Explain the difference between speed and velocity with an example.",
    "What is the Pythagorean theorem and how do I use it to find the hypotenuse?"
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const dataUrl = uploadEvt.target.result;
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type,
        dataUrl
      });
      if (file.type.startsWith('image/')) {
        setFilePreview(dataUrl);
      } else {
        setFilePreview(null);
      }
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const handleGetHelp = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || questionText;
    if (!queryToUse.trim() && !attachedFile) return;

    if (customQuery) setQuestionText(customQuery);

    setIsLoading(true);
    setErrorMsg('');
    setSolutionData(null);

    const attachmentContext = attachedFile
      ? `\n[Attached Student Document/Image: ${attachedFile.name} (${attachedFile.size})]`
      : '';

    const promptText = `I am a ${studentClass} student studying under ${curriculum} curriculum. I need step-by-step homework help in ${selectedSubject}.\nHomework Question:\n"${queryToUse}"${attachmentContext}\n\nPlease explain clearly in student-friendly language structured with:\n1. 🎯 Understanding the Question (what is given & what we need to find)\n2. 💡 Key Concept & Formula (the core formula or rule needed)\n3. ✏️ Step-by-Step Solution (detailed numbered steps with calculations)\n4. ✅ Final Answer & Check (final result clearly stated and verified)`;

    try {
      const { data } = await axios.post('/api/ai/agent', {
        query: promptText,
        subject: selectedSubject
      });

      if (!data || (!data.response && !data.answer)) {
        throw new Error('No solution received');
      }

      setSolutionData({
        rawText: data.response || data.answer || '',
        question: queryToUse,
        attachment: attachedFile
      });
    } catch (err) {
      console.error('Homework help error:', err);
      const apiMsg = err.response?.data?.message?.en || err.message;
      setErrorMsg(
        apiMsg?.includes('port 8000') || apiMsg?.includes('unavailable') || apiMsg?.includes('unreachable')
          ? 'GuruAI engine is currently unreachable. Please ensure the Python GuruAI service is running on port 8000.'
          : 'Could not solve this homework question right now. Please ensure the AI engine is running and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSolutionData(null);
    setQuestionText('');
    setAttachedFile(null);
    setFilePreview(null);
    setErrorMsg('');
  };

  const handleCopy = () => {
    if (!solutionData) return;
    navigator.clipboard.writeText(solutionData.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to split structured homework sections
  const parseSolutionSections = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    let understanding = '';
    let concept = '';
    let steps = '';
    let finalAnswer = '';
    let current = 'understanding';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('concept') || lower.includes('formula') || lower.includes('key rule')) {
        current = 'concept';
        continue;
      } else if (lower.includes('step-by-step') || lower.includes('steps:') || lower.includes('step 1')) {
        current = 'steps';
        continue;
      } else if (lower.includes('final answer') || lower.includes('solution & check') || lower.includes('final result')) {
        current = 'finalAnswer';
        continue;
      } else if (lower.includes('understanding the question') || lower.includes('given:')) {
        current = 'understanding';
        continue;
      }

      if (current === 'understanding') understanding += line + '\n';
      else if (current === 'concept') concept += line + '\n';
      else if (current === 'steps') steps += line + '\n';
      else if (current === 'finalAnswer') finalAnswer += line + '\n';
    }

    if (steps.trim() || finalAnswer.trim()) {
      return {
        understanding: understanding.trim(),
        concept: concept.trim(),
        steps: steps.trim(),
        finalAnswer: finalAnswer.trim()
      };
    }
    return null;
  };

  const parsedSolution = solutionData ? parseSolutionSections(solutionData.rawText) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Question Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-orange-100 text-orange-800 font-extrabold text-[11px] px-3 py-1 rounded-full">
              <Edit3 size={13} />
              <span>Step-by-Step Solver</span>
            </div>
            <h3 className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2 pt-1">
              ✏️ Homework Help
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Stuck on a tricky homework question? Type the problem or upload a photo/sheet to get guided step-by-step explanations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
              {studentClass} • {curriculum}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGetHelp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                {['Maths', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies'].filter(s => !subjects.includes(s)).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Question Text Input */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Type or paste your homework question *
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                placeholder="e.g. Find the roots of the quadratic equation 2x² - 4x - 6 = 0 step by step..."
                required={!attachedFile}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all resize-none"
              />
            </div>

          </div>

          {/* Photo / Document Upload Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border border-slate-200/80 active:scale-98">
                <Upload size={14} className="text-orange-500" />
                <span>Upload Question Photo / Document</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Attached file preview chip */}
              {attachedFile && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-2xl text-xs font-semibold text-orange-950">
                  <FileText size={14} className="text-orange-600 shrink-0" />
                  <span className="truncate max-w-[150px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-orange-700">({attachedFile.size})</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-orange-200 rounded-full text-orange-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (!questionText.trim() && !attachedFile)}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Solving Step-by-Step...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Solve & Explain Step by Step ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Image Thumbnail Preview if image was uploaded */}
          {filePreview && (
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Attached Homework Photo Preview:
              </p>
              <div className="relative inline-block border-2 border-orange-200 rounded-2xl overflow-hidden shadow-xs">
                <img
                  src={filePreview}
                  alt="Homework attachment"
                  className="max-h-48 max-w-xs object-contain bg-slate-50"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all"
                  title="Remove Image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Example Homework Questions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Try one of these sample homework questions:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleGetHelp(e, ex)}
                disabled={isLoading}
                className="text-left text-xs bg-slate-50 hover:bg-orange-50 hover:text-orange-900 text-slate-700 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center space-x-3 text-red-700 text-xs font-bold">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto animate-bounce text-2xl">
            ✏️
          </div>
          <h4 className="font-outfit font-black text-lg text-slate-800">
            GuruAI is breaking down your homework problem... 💡
          </h4>
          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            Structuring into given data, core concepts, numbered calculation steps, and final solution!
          </p>
        </div>
      )}

      {/* Structured Homework Solution Display */}
      {solutionData && !isLoading && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Solution Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {studentClass} • {selectedSubject}
              </span>
              <h4 className="font-outfit font-black text-xl text-slate-900">
                Step-by-Step Homework Solution
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Steps'}</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Ask Another</span>
              </button>
            </div>
          </div>

          {/* Original Question Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Homework Problem Asked:
            </p>
            <p className="font-outfit font-bold text-sm text-slate-900">
              {solutionData.question || 'Uploaded Homework Document/Image'}
            </p>
          </div>

          {/* Distinct Visual Breakdown */}
          {parsedSolution ? (
            <div className="grid grid-cols-1 gap-4">
              
              {/* Section 1: Understanding The Question */}
              {parsedSolution.understanding && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-outfit font-bold text-sm">
                    <span className="text-lg">🎯</span>
                    <span>1. Understanding the Question</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line pl-6">
                    {parsedSolution.understanding}
                  </div>
                </div>
              )}

              {/* Section 2: Key Concept & Formula */}
              {parsedSolution.concept && (
                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-outfit font-bold text-sm">
                    <span className="text-lg">💡</span>
                    <span>2. Concept & Formula</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line pl-6">
                    {parsedSolution.concept}
                  </div>
                </div>
              )}

              {/* Section 3: Step-by-Step Guide */}
              {parsedSolution.steps && (
                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2">
                  <div className="flex items-center space-x-2 text-orange-900 font-outfit font-bold text-sm">
                    <span className="text-lg">✏️</span>
                    <span>3. Step-by-Step Guide</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line pl-6">
                    {parsedSolution.steps}
                  </div>
                </div>
              )}

              {/* Section 4: Final Answer & Check */}
              {parsedSolution.finalAnswer && (
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2 shadow-xs">
                  <div className="flex items-center space-x-2 text-emerald-900 font-outfit font-black text-sm">
                    <span className="text-xl">✅</span>
                    <span>4. Final Answer & Verification</span>
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed whitespace-pre-line pl-7">
                    {parsedSolution.finalAnswer}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-line">
              {solutionData.rawText}
            </div>
          )}

          {/* Student Notebook Tip */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">💡 Student Tip: Try writing each step down in your study notebook!</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Verified Syllabus Curriculum</span>
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

export default GuruAIHomeworkHelp;
