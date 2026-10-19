import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen, Sparkles, Lightbulb, Copy, Check,
  AlertCircle, RefreshCw, CheckCircle2, HelpCircle,
  ArrowRight, FileText, Send, MessageCircle
} from 'lucide-react';

const GuruAITopicExplainer = ({
  studentClass = 'Class 7',
  joinedTeachers = [],
  userName = '',
  subjects = ['Maths', 'Science'],
  curriculum = 'CBSE',
  preferredLanguage = 'English'
}) => {
  const [topic, setTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(() => subjects[0] || 'Science');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Teacher notes fetched for 1-click topic selection
  const [studentNotes, setStudentNotes] = useState([]);

  // Follow-up questions state: [ { question: string, answer: string, isLoading?: boolean } ]
  const [followUps, setFollowUps] = useState([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  useEffect(() => {
    fetchStudentNotes();
  }, []);

  const fetchStudentNotes = async () => {
    try {
      const { data } = await axios.get('/api/classroom/notes/student');
      if (Array.isArray(data)) {
        setStudentNotes(data);
      }
    } catch (err) {
      // Non-critical, ignore
    }
  };

  const handleStartLearning = async (e, customTopic = null) => {
    if (e) e.preventDefault();
    const topicToLearn = customTopic || topic;
    if (!topicToLearn || !topicToLearn.trim()) return;

    if (customTopic) setTopic(customTopic);

    setIsLoading(true);
    setErrorMsg('');
    setLessonData(null);
    setFollowUps([]);
    setFollowUpInput('');

    try {
      const { data } = await axios.post('/api/ai/explain', {
        topic: topicToLearn.trim(),
        subject: selectedSubject,
        className: studentClass,
        mode: 'simple'
      });

      if (!data || !data.explanation) {
        throw new Error('No lesson content received');
      }

      setLessonData(data);
    } catch (err) {
      console.error('Explain topic error:', err);
      const apiMsg = err.response?.data?.message?.en || err.message;
      setErrorMsg(
        apiMsg?.includes('port 8000') || apiMsg?.includes('unavailable') || apiMsg?.includes('unreachable')
          ? 'GuruAI engine is currently unreachable. Please ensure the Python GuruAI service is running on port 8000.'
          : 'Could not prepare the lesson right now. Please ensure the AI engine is running and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpInput.trim() || isFollowUpLoading || !lessonData) return;

    const questionText = followUpInput.trim();
    setFollowUpInput('');
    setIsFollowUpLoading(true);

    const newFollowUpItem = {
      question: questionText,
      answer: '',
      isLoading: true
    };
    setFollowUps(prev => [...prev, newFollowUpItem]);

    try {
      const prompt = `Student is learning the topic: "${lessonData.topic}" (${selectedSubject}, ${studentClass}, ${curriculum}). Follow-up question: "${questionText}". Explain in simple, student-friendly terms with an example.`;
      const { data } = await axios.post('/api/ai/chat', {
        message: prompt,
        studentClass,
        curriculum,
        preferredLanguage,
        subject: selectedSubject,
        mode: 'explain'
      });

      const reply = data.answer || data.message?.content || 'Here is the explanation for your follow-up.';
      setFollowUps(prev =>
        prev.map(item =>
          item.question === questionText
            ? { ...item, answer: reply, isLoading: false }
            : item
        )
      );
    } catch (err) {
      setFollowUps(prev =>
        prev.map(item =>
          item.question === questionText
            ? { ...item, answer: 'Sorry, could not answer the follow-up question right now. Please check if the AI service is running.', isLoading: false }
            : item
        )
      );
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleCopy = () => {
    if (!lessonData) return;
    navigator.clipboard.writeText(lessonData.explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: Try to parse structured sections if present in explanation
  const parseSections = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    let explanation = '';
    let examples = '';
    let keyPoints = '';
    let summary = '';
    let currentSection = 'explanation';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('real-life example') || lower.includes('example:') || lower.includes('real world example')) {
        currentSection = 'examples';
        continue;
      } else if (lower.includes('important points') || lower.includes('key point') || lower.includes('points to remember')) {
        currentSection = 'keyPoints';
        continue;
      } else if (lower.includes('summary') || lower.includes('in short') || lower.includes('quick recap')) {
        currentSection = 'summary';
        continue;
      } else if (lower.includes('simple explanation') || lower.includes('explanation:')) {
        currentSection = 'explanation';
        continue;
      }

      if (currentSection === 'explanation') explanation += line + '\n';
      else if (currentSection === 'examples') examples += line + '\n';
      else if (currentSection === 'keyPoints') keyPoints += line + '\n';
      else if (currentSection === 'summary') summary += line + '\n';
    }

    if (examples.trim() || keyPoints.trim() || summary.trim()) {
      return {
        explanation: explanation.trim() || text,
        examples: examples.trim(),
        keyPoints: keyPoints.trim(),
        summary: summary.trim()
      };
    }
    return null;
  };

  const parsedLesson = lessonData ? parseSections(lessonData.explanation) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Generator Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 font-extrabold text-[11px] px-3 py-1 rounded-full">
              <BookOpen size={13} />
              <span>Personalized Topic Learning</span>
            </div>
            <h3 className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2 pt-1">
              📚 Learn a Topic
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enter any topic from your syllabus to get an easy explanation, real-world examples, key points, and a quick summary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
              {studentClass} • {curriculum}
            </span>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleStartLearning} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Subject Dropdown */}
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
                {['Maths', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology'].filter(s => !subjects.includes(s)).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Topic Input */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                What topic do you want to learn? *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Fractions, Photosynthesis, Gravity, Acids and Bases..."
                  required
                  className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Preparing Lesson...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Start Learning ✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* 1-Click Topic Suggestions from Teacher Study Notes or Common Syllabus Topics */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Suggested topics for your class & teacher notes:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {studentNotes && studentNotes.length > 0 && studentNotes.slice(0, 3).map((note) => (
              <button
                key={note._id}
                type="button"
                onClick={() => handleStartLearning(null, note.title)}
                className="text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText size={12} className="text-emerald-600 shrink-0" />
                <span>{note.title}</span>
              </button>
            ))}

            {['Fractions with examples', 'Photosynthesis process', 'Laws of Motion', 'Water Cycle', 'Algebra basics'].map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStartLearning(null, ex)}
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
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto animate-pulse text-2xl">
            📖
          </div>
          <h4 className="font-outfit font-black text-lg text-slate-800">
            GuruAI is structuring your lesson on "{topic}"... ✨
          </h4>
          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            Breaking down the topic into easy explanations, real-world examples, and key points tailored to {studentClass}!
          </p>
        </div>
      )}

      {/* Structured Lesson Output */}
      {lessonData && !isLoading && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Lesson Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {studentClass} • {selectedSubject}
                </span>
                {lessonData.has_context && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Grounded in Teacher Notes</span>
                  </span>
                )}
              </div>
              <h4 className="font-outfit font-black text-2xl text-slate-900 capitalize">
                {lessonData.topic || topic}
              </h4>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Lesson'}</span>
            </button>
          </div>

          {/* Structured Presentation */}
          {parsedLesson ? (
            <div className="grid grid-cols-1 gap-4">
              {/* 1. Easy Explanation */}
              <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2">
                <div className="flex items-center space-x-2 text-orange-900 font-outfit font-bold text-sm">
                  <span className="text-lg">💡</span>
                  <span>Easy Explanation</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {parsedLesson.explanation}
                </div>
              </div>

              {/* 2. Real-Life Examples */}
              {parsedLesson.examples && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-outfit font-bold text-sm">
                    <span className="text-lg">🔍</span>
                    <span>Real-Life Examples</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsedLesson.examples}
                  </div>
                </div>
              )}

              {/* 3. Key Points */}
              {parsedLesson.keyPoints && (
                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-outfit font-bold text-sm">
                    <span className="text-lg">⭐</span>
                    <span>Key Points to Remember</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsedLesson.keyPoints}
                  </div>
                </div>
              )}

              {/* 4. Short Summary */}
              {parsedLesson.summary && (
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 font-outfit font-bold text-sm">
                    <span className="text-lg">📝</span>
                    <span>Short Summary</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                    {parsedLesson.summary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-line">
              {lessonData.explanation}
            </div>
          )}

          {/* Sources Grounding Info */}
          {lessonData.sources && lessonData.sources.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-500">Sources:</span>
              {lessonData.sources.map((s, idx) => (
                <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700">
                  📄 {s.title || s.document || 'Teacher Study Note'}
                </span>
              ))}
            </div>
          )}

          {/* Follow-up Questions Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-outfit font-bold text-sm">
              <MessageCircle size={17} className="text-orange-500" />
              <span>Have a follow-up question about this topic?</span>
            </div>

            {/* Existing Follow-ups List */}
            {followUps.length > 0 && (
              <div className="space-y-3">
                {followUps.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">Q</span>
                      <span>{item.question}</span>
                    </div>
                    <div className="text-xs text-slate-700 pl-7 leading-relaxed">
                      {item.isLoading ? (
                        <span className="inline-flex items-center space-x-1.5 text-orange-600 font-semibold">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>GuruAI is writing your explanation...</span>
                        </span>
                      ) : (
                        <p className="whitespace-pre-line">{item.answer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up Input */}
            <form onSubmit={handleSendFollowUp} className="flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder={`Ask anything more about ${lessonData.topic || topic}...`}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all"
              />
              <button
                type="submit"
                disabled={isFollowUpLoading || !followUpInput.trim()}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isFollowUpLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Ask Follow-up</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default GuruAITopicExplainer;
