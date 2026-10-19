import React, { useState } from 'react';
import axios from 'axios';
import { X, Check, Sparkles, GraduationCap, BookOpen, Globe, Compass, AlertCircle } from 'lucide-react';
import {
  CLASS_OPTIONS,
  SUBJECT_OPTIONS,
  BOARD_OPTIONS,
  LANGUAGE_OPTIONS
} from '../../utils/studentCurriculum';

const LearningPreferencesModal = ({
  isOpen,
  onClose,
  currentClass = '',
  currentSubjects = [],
  currentCurriculum = 'CBSE',
  currentLanguage = 'English',
  onSaved
}) => {
  const [selectedClass, setSelectedClass] = useState(currentClass || 'Class 7');
  const [selectedSubjects, setSelectedSubjects] = useState(
    currentSubjects && currentSubjects.length > 0 ? currentSubjects : ['Maths', 'Science']
  );
  const [selectedCurriculum, setSelectedCurriculum] = useState(currentCurriculum || 'CBSE');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'English');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleSubject = (subName) => {
    if (selectedSubjects.includes(subName)) {
      // Don't allow removing all subjects
      if (selectedSubjects.length === 1) return;
      setSelectedSubjects(prev => prev.filter(s => s !== subName));
    } else {
      setSelectedSubjects(prev => [...prev, subName]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setErrorMsg('Please select your class level.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one subject you want to study.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await axios.put('/api/students/profile', {
        class: selectedClass,
        subjects: selectedSubjects,
        curriculum: selectedCurriculum,
        preferredLanguage: selectedLanguage
      });

      if (onSaved) {
        onSaved({
          studentClass: selectedClass,
          subjects: selectedSubjects,
          curriculum: selectedCurriculum,
          preferredLanguage: selectedLanguage
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to update learning preferences:', err);
      setErrorMsg('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} className="text-orange-500" />
              <span>Personalize Your Study Buddy</span>
            </div>
            <h3 className="font-outfit font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              Your Learning Preferences
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              GuruAI will customize all explanations, quizzes, and homework help to your exact grade and subjects.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-red-700 text-xs font-bold">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* 1. Class Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5 tracking-wider">
              <GraduationCap size={15} className="text-orange-500" />
              <span>1. Your Class / Grade Level:</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CLASS_OPTIONS.map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Subjects Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5 tracking-wider">
                <BookOpen size={15} className="text-orange-500" />
                <span>2. Subjects You Study:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">Tap to select/unselect</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.name);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.name)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{sub.icon}</span>
                      <span>{sub.name}</span>
                    </span>
                    {isSelected && <Check size={14} className="text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Board / Curriculum Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5 tracking-wider">
              <Compass size={15} className="text-orange-500" />
              <span>3. Board / Curriculum:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BOARD_OPTIONS.map((b) => {
                const isSelected = selectedCurriculum === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedCurriculum(b.id)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Preferred Language */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5 tracking-wider">
              <Globe size={15} className="text-orange-500" />
              <span>4. Preferred Learning Language:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Save & Personalize</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default LearningPreferencesModal;
