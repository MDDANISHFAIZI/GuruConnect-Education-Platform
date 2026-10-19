import React, { useState } from 'react';
import {
  MessageSquare, BookOpen, BrainCircuit, Edit3, Sparkles, Settings
} from 'lucide-react';
import GuruAIChat from './GuruAIChat';
import GuruAITopicExplainer from './GuruAITopicExplainer';
import GuruAIQuiz from './GuruAIQuiz';
import GuruAIHomeworkHelp from './GuruAIHomeworkHelp';
import LearningPreferencesModal from './LearningPreferencesModal';

const GuruAIHub = ({
  studentClass = 'Class 7',
  joinedTeachers = [],
  userName = '',
  subjects = ['Maths', 'Science'],
  curriculum = 'CBSE',
  preferredLanguage = 'English',
  onPreferencesUpdated
}) => {
  // 4 distinct modes: 'chat' | 'learn' | 'quiz' | 'homework'
  const [activeTab, setActiveTab] = useState('chat');
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userName ? userName.trim().split(' ')[0] : 'Student';
  const greetingText = `${getGreeting()}, ${displayName}!`;

  const tabs = [
    {
      id: 'chat',
      label: 'Ask GuruAI',
      icon: MessageSquare,
      badge: 'Chat',
      description: 'Conversational assistant for syllabus & study notes'
    },
    {
      id: 'learn',
      label: 'Learn a Topic',
      icon: BookOpen,
      badge: 'Lessons',
      description: 'Structured explanations with examples & key points'
    },
    {
      id: 'quiz',
      label: 'Practice Quiz',
      icon: BrainCircuit,
      badge: 'MCQ Test',
      description: 'Interactive questions with instant scores & review'
    },
    {
      id: 'homework',
      label: 'Homework Help',
      icon: Edit3,
      badge: 'Step-by-Step',
      description: 'Solve tricky questions with photo/document upload'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="guruai-section">
      
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-extrabold text-orange-300">
              <Sparkles size={14} className="text-orange-400" />
              <span>GuruAI — Your Personal Study Buddy</span>
            </div>

            {/* Quick Profile Capsule */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-slate-200">
                🎓 {studentClass || 'Class 7'}
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-orange-300">
                {curriculum || 'CBSE'}
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                🗣️ {preferredLanguage || 'English'}
              </span>
              <button
                onClick={() => setIsPrefModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs active:scale-95"
                title="Change Class, Subjects, or Language"
              >
                <Settings size={12} />
                <span>Preferences</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 max-w-2xl">
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-white tracking-tight">
              {greetingText}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Choose a study feature below. Every mode is customized for your <strong>{studentClass || 'grade'}</strong> level in <strong>{curriculum || 'CBSE'}</strong>.
            </p>
          </div>

          {/* Quick Subject Focus Pills */}
          {subjects && subjects.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Your Subjects:
              </span>
              {subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="bg-white/10 border border-white/15 text-slate-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <span>{sub}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs / Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-orange-500/40 transform -translate-y-0.5'
                  : 'bg-white border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/30 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-orange-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </div>
              <div>
                <h4 className="font-outfit font-black text-sm sm:text-base">
                  {tab.label}
                </h4>
                <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                  isActive ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Distinct Interface for Each Feature */}
      <div className="transition-all duration-200">
        {activeTab === 'chat' && (
          <GuruAIChat
            studentClass={studentClass}
            joinedTeachers={joinedTeachers}
            userName={userName}
            subjects={subjects}
            curriculum={curriculum}
            preferredLanguage={preferredLanguage}
            onOpenPreferences={() => setIsPrefModalOpen(true)}
          />
        )}

        {activeTab === 'learn' && (
          <GuruAITopicExplainer
            studentClass={studentClass}
            joinedTeachers={joinedTeachers}
            userName={userName}
            subjects={subjects}
            curriculum={curriculum}
            preferredLanguage={preferredLanguage}
          />
        )}

        {activeTab === 'quiz' && (
          <GuruAIQuiz
            studentClass={studentClass}
            joinedTeachers={joinedTeachers}
            userName={userName}
            subjects={subjects}
            curriculum={curriculum}
            preferredLanguage={preferredLanguage}
          />
        )}

        {activeTab === 'homework' && (
          <GuruAIHomeworkHelp
            studentClass={studentClass}
            joinedTeachers={joinedTeachers}
            userName={userName}
            subjects={subjects}
            curriculum={curriculum}
            preferredLanguage={preferredLanguage}
          />
        )}
      </div>

      {/* Preferences Modal */}
      <LearningPreferencesModal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        currentClass={studentClass}
        currentSubjects={subjects}
        currentCurriculum={curriculum}
        currentLanguage={preferredLanguage}
        onSaved={(newPrefs) => {
          if (onPreferencesUpdated) {
            onPreferencesUpdated(newPrefs);
          }
        }}
      />

    </div>
  );
};

export default GuruAIHub;
