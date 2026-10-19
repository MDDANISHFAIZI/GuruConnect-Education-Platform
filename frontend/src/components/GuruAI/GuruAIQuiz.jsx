import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BrainCircuit, CheckCircle2, XCircle, Award, RotateCcw,
  Sparkles, BookOpen, Clock, AlertCircle, ArrowRight, Check, Eye,
  FileText, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';

const GuruAIQuiz = ({
  studentClass = 'Class 7',
  joinedTeachers = [],
  userName = '',
  subjects = ['Maths', 'Science'],
  curriculum = 'CBSE',
  preferredLanguage = 'English'
}) => {
  const [topic, setTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(() => subjects[0] || 'Science');
  const [selectedClass, setSelectedClass] = useState(studentClass || 'Class 7');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { 0: 'A', 1: 'B' }
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(true);

  // Available teacher study notes
  const [studentNotes, setStudentNotes] = useState([]);

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

  const handleGenerateQuiz = async (e, customTopic = null) => {
    if (e) e.preventDefault();
    const topicToUse = customTopic || topic;
    if (!topicToUse || !topicToUse.trim()) return;

    if (customTopic) setTopic(customTopic);

    setIsLoading(true);
    setErrorMsg('');
    setQuizData(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
    setScore(0);

    try {
      const { data } = await axios.post('/api/ai/quiz', {
        topic: topicToUse.trim(),
        subject: selectedSubject,
        className: selectedClass,
        numQuestions: Number(numQuestions),
        difficulty: difficulty
      });

      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('No questions received from AI');
      }

      setQuizData(data);
    } catch (err) {
      console.error('Quiz generation error:', err);
      const apiMsg = err.response?.data?.message?.en || err.message;
      setErrorMsg(
        apiMsg?.includes('port 8000') || apiMsg?.includes('unavailable') || apiMsg?.includes('unreachable')
          ? 'GuruAI engine is currently unreachable. Please ensure the Python GuruAI service is running on port 8000.'
          : 'Could not generate questions for this topic right now. Please ensure the AI engine is running and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionLetter) => {
    if (isQuizFinished) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionLetter
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Deterministic Score Calculation
  const finishQuiz = () => {
    if (!quizData || !quizData.questions) return;

    let calculatedScore = 0;
    quizData.questions.forEach((q, idx) => {
      const userSelected = userAnswers[idx];
      const correctOption = q.correctAnswer;
      if (userSelected && correctOption && userSelected.trim().toUpperCase() === correctOption.trim().toUpperCase()) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsQuizFinished(true);
    setShowReview(true);
  };

  const handleReset = () => {
    setQuizData(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
    setScore(0);
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
    setScore(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Quiz Setup Screen (shown when no quiz is currently active) */}
      {!quizData && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-orange-100 text-orange-800 font-extrabold text-[11px] px-3 py-1 rounded-full">
                <BrainCircuit size={13} />
                <span>Dedicated Quiz Assessment</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2 pt-1">
                📝 Practice Quiz
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Test your knowledge one question at a time with instant score calculation, detailed explanations, and review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
                {studentClass} • {curriculum}
              </span>
            </div>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  {['Maths', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology'].filter(s => !subjects.includes(s)).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Topic Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Quiz Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Fractions, Electricity, Motion..."
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all"
                />
              </div>

              {/* Number of Questions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="Easy">Easy (Fundamentals)</option>
                  <option value="Medium">Medium (Standard)</option>
                  <option value="Hard">Hard (Advanced)</option>
                </select>
              </div>

              {/* Start Quiz Button */}
              <div className="sm:col-span-2 lg:col-span-4 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="animate-spin" size={17} />
                      <span>Creating Your Quiz... 🚀</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={17} />
                      <span>Start Practice Quiz 🚀</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>

          {/* Quick Select from Teacher Study Materials */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <BookOpen size={13} className="text-orange-500" />
              <span>Or choose from your uploaded teacher study materials:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {studentNotes && studentNotes.length > 0 ? (
                studentNotes.slice(0, 4).map((note) => (
                  <button
                    key={note._id}
                    type="button"
                    onClick={() => handleGenerateQuiz(null, note.title)}
                    className="text-left text-xs bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FileText size={12} className="text-orange-600 shrink-0" />
                    <span>{note.title}</span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">
                  No uploaded teacher notes yet. Type any syllabus topic above to generate a practice quiz!
                </span>
              )}
            </div>
          </div>

        </div>
      )}

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
            📝
          </div>
          <h4 className="font-outfit font-black text-lg text-slate-800">
            GuruAI is generating your quiz on "{topic}"... 🚀
          </h4>
          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            Preparing {numQuestions} curriculum-aligned multiple-choice questions with answer keys!
          </p>
        </div>
      )}

      {/* Active Quiz View (Single Question at a Time) */}
      {quizData && !isQuizFinished && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {difficulty}
                </span>
              </div>
              <h4 className="font-outfit font-black text-lg text-slate-900 mt-0.5">
                {quizData.topic || topic}
              </h4>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-red-600 font-bold cursor-pointer transition-colors"
            >
              Exit Quiz
            </button>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Jump Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quizData.questions.map((_, qIdx) => {
              const isCurrent = currentQuestionIndex === qIdx;
              const isAnswered = userAnswers[qIdx] !== undefined;
              return (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(qIdx)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? 'bg-orange-500 text-white ring-2 ring-orange-300 shadow-xs'
                      : isAnswered
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Body */}
          {(() => {
            const currentQ = quizData.questions[currentQuestionIndex];
            const selectedOpt = userAnswers[currentQuestionIndex];

            return (
              <div className="space-y-6 pt-2">
                <h3 className="font-outfit font-black text-lg sm:text-xl text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt, oIdx) => {
                    const optionLetter = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                    const isSelected = selectedOpt === optionLetter;

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(optionLetter)}
                        className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs ring-2 ring-orange-400/30'
                            : 'border-slate-200/80 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>

                        {isSelected && <Check size={18} className="text-orange-500 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!selectedOpt}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex === quizData.questions.length - 1
                        ? 'Submit Quiz 🎉'
                        : 'Next Question'}
                    </span>
                    {currentQuestionIndex < quizData.questions.length - 1 && (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* Quiz Complete / Results Screen */}
      {quizData && isQuizFinished && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md text-4xl animate-bounce">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="font-outfit font-black text-2xl text-slate-900">
                Quiz Completed!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Here are your results for <strong className="text-slate-800">{quizData.topic || topic}</strong>
              </p>
            </div>

            {/* Score Badge */}
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl inline-block space-y-2 min-w-[220px]">
              <p className="text-[10px] uppercase font-black tracking-wider text-orange-600">
                Your Score
              </p>
              <p className="font-outfit font-black text-4xl text-orange-600">
                {score} / {quizData.questions.length}
              </p>
              <p className="text-xs font-extrabold text-orange-950">
                {score === quizData.questions.length
                  ? '🌟 Perfect Score! Excellent Work!'
                  : score >= quizData.questions.length / 2
                  ? '👏 Great job! Keep practicing!'
                  : '💪 Good attempt! Review the answers below to learn!'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                onClick={handleRetake}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={handleReset}
                className="px-5 py-3 bg-orange-100 hover:bg-orange-200 text-orange-900 font-extrabold text-xs rounded-2xl transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Try Another Topic</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="text-left pt-6 border-t border-slate-100 space-y-4">
            <h4 className="font-outfit font-black text-lg text-slate-900 flex items-center gap-2">
              <Eye size={18} className="text-orange-500" />
              <span>Question-by-Question Review & Explanations:</span>
            </h4>

            <div className="space-y-4">
              {quizData.questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const isCorrect = userAns && userAns.toUpperCase() === q.correctAnswer.toUpperCase();

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-2.5 ${
                      isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-outfit font-bold text-sm text-slate-900 leading-snug">
                        {idx + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                          <CheckCircle2 size={13} />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                          <XCircle size={13} />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                      <div className={`p-2.5 rounded-xl border ${
                        isCorrect ? 'bg-white border-emerald-200 text-emerald-900' : 'bg-white border-rose-200 text-rose-900'
                      }`}>
                        <span className="font-bold">Your Answer:</span> Option {userAns || 'Not Answered'}
                      </div>
                      <div className="p-2.5 rounded-xl border bg-white border-emerald-200 text-emerald-900">
                        <span className="font-bold">Correct Answer:</span> Option {q.correctAnswer}
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="p-3 bg-white/80 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-200/60">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <HelpCircle size={13} className="text-orange-500" />
                          <span>Explanation:</span>
                        </p>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default GuruAIQuiz;
