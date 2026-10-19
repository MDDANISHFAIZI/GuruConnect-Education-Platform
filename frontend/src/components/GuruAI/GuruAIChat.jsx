import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Sparkles, Send, BookOpen, Clock, Trash2, Plus,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Copy, Check,
  MessageSquare, CheckCircle2, HelpCircle, Lightbulb, ArrowRight,
  Menu, X
} from 'lucide-react';
import { getRecommendedPrompts } from '../../utils/studentCurriculum';

const GuruAIChat = ({
  studentClass = 'Class 7',
  joinedTeachers = [],
  userName = '',
  subjects = ['Maths', 'Science'],
  curriculum = 'CBSE',
  preferredLanguage = 'English',
  onOpenPreferences
}) => {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested conversational prompts for this student's grade & subjects
  const recommendedPrompts = getRecommendedPrompts(studentClass, subjects, preferredLanguage);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchConversationMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/api/ai/conversations');
      setConversations(data || []);
      if (data && data.length > 0 && !activeConvId) {
        setActiveConvId(data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchConversationMessages = async (convId) => {
    try {
      const { data } = await axios.get(`/api/ai/conversations/${convId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleStartNewSession = () => {
    setActiveConvId(null);
    setMessages([]);
    setErrorMsg('');
    setIsLoading(false);
    setShowMobileHistory(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/ai/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputQuery;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    setInputQuery('');
    setLastQuery(textToSend);
    setErrorMsg('');

    // Optimistic user message
    const tempUserMsgId = `temp_user_${Date.now()}`;
    const tempUserMsg = {
      _id: tempUserMsgId,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', {
        message: textToSend,
        conversationId: activeConvId,
        studentClass,
        curriculum,
        preferredLanguage,
        mode: 'chat',
        subject: selectedSubject || (subjects?.[0] || 'General')
      });

      if (!activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        fetchConversations();
      }

      const aiMsg = {
        _id: data.message?._id || `msg_${Date.now()}`,
        role: 'assistant',
        content: data.answer || data.message?.content || 'Here is your explanation.',
        sources: data.sources || [],
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const apiMsg = err.response?.data?.message?.en || err.message;
      setErrorMsg(
        apiMsg?.includes('port 8000') || apiMsg?.includes('unavailable') || apiMsg?.includes('unreachable')
          ? 'GuruAI engine is currently unreachable. Please ensure the Python GuruAI service is running on port 8000.'
          : 'Could not send message. Please ensure the AI engine is running and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (msgId) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const copyToClipboard = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const formatStudentSource = (src) => {
    if (!src) return '';
    const title = src.title || src.document || 'Teacher Study Note';
    const teacher = src.teacherName ? ` • ${src.teacherName}` : '';
    const page = src.page ? ` (Page ${src.page})` : '';
    return `📄 ${title}${teacher}${page}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in text-left">
      
      {/* Mobile Toggle Button for Conversation History */}
      <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-orange-500" />
          <span>Past Study Chats ({conversations.length})</span>
        </span>
        <button
          onClick={() => setShowMobileHistory(!showMobileHistory)}
          className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
        >
          {showMobileHistory ? <X size={13} /> : <Menu size={13} />}
          <span>{showMobileHistory ? 'Close History' : 'View History'}</span>
        </button>
      </div>

      {/* Left Sidebar: Study Sessions & History */}
      <div className={`${showMobileHistory ? 'block' : 'hidden'} lg:block space-y-4`}>
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-outfit font-black text-sm text-slate-800 flex items-center space-x-1.5">
              <Clock size={14} className="text-orange-500" />
              <span>Study Chats</span>
            </h4>
            <button
              onClick={handleStartNewSession}
              className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all cursor-pointer"
              title="New Chat Session"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleStartNewSession}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>New Chat Session</span>
          </button>

          {/* Conversations List */}
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin text-left">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium italic p-3 text-center">
                No past chats yet. Ask a question to begin!
              </p>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConvId === conv._id;
                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConvId(conv._id);
                      setShowMobileHistory(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer text-xs font-semibold transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">
                      {conv.title || 'Study Session'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                      title="Delete Chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tip Card */}
        <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-100 text-[11px] text-orange-950 font-medium text-left">
          <p className="font-bold flex items-center gap-1 text-orange-800">
            <Sparkles size={13} className="text-orange-500" />
            <span>Ask GuruAI Anything</span>
          </p>
          <p className="mt-1 text-slate-600 leading-relaxed">
            Ask any question about your syllabus concepts, teacher-uploaded notes, or definitions.
          </p>
        </div>
      </div>

      {/* Main Conversational Chat Area */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[580px] lg:col-span-3">
        
        {/* Chat Top Header */}
        <div className="pb-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
            <div className="space-y-0.5">
              <h3 className="font-outfit font-black text-xl text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  💬
                </span>
                <span>Ask GuruAI Study Chat</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Personalized for {studentClass || 'Class 7'} • {curriculum || 'CBSE'} • {preferredLanguage || 'English'}
              </p>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedSubject('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  !selectedSubject
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Subjects
              </button>
              {(subjects || []).map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedSubject === sub
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 my-4 space-y-4 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
          
          {/* Welcome State when no messages */}
          {messages.length === 0 && (
            <div className="text-center py-6 px-2 sm:px-4 space-y-6">
              
              <div className="space-y-1.5 max-w-lg mx-auto text-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-orange-400 to-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-md text-2xl mb-2">
                  👋
                </div>
                <h4 className="font-outfit font-black text-2xl text-slate-900 tracking-tight">
                  Hi{userName ? ` ${userName.trim().split(' ')[0]}` : ''}! What would you like to ask?
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Type any question below or click a suggested syllabus question to start chatting.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="max-w-xl mx-auto space-y-2 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Lightbulb size={13} className="text-amber-500" />
                  <span>Suggested questions for {studentClass}:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendedPrompts.slice(0, 4).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="p-3 bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-300 rounded-2xl text-xs font-semibold text-slate-700 hover:text-orange-950 transition-all text-left flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate mr-2">"{prompt.text}"</span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-orange-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isSourcesOpen = !!expandedSources[msg._id || idx];
            const hasSources = msg.sources && msg.sources.length > 0;

            return (
              <div
                key={msg._id || idx}
                className={`flex gap-3 text-left ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-1 shadow-xs">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-3 ${
                    isUser
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Top Bar for Assistant Message: Timestamp & Copy */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-[10px] text-slate-400 font-semibold">
                      <span>GuruAI • {studentClass}</span>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg._id || idx)}
                        className="hover:text-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Copy Response"
                      >
                        {copiedMsgId === (msg._id || idx) ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line ${
                    isUser ? 'text-white' : 'text-slate-700'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Grounded Sources Accordion */}
                  {hasSources && !isUser && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <button
                        onClick={() => toggleSources(msg._id || idx)}
                        className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>Based on teacher study notes ({msg.sources.length})</span>
                        {isSourcesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isSourcesOpen && (
                        <div className="pt-1 space-y-1">
                          {msg.sources.map((src, sIdx) => (
                            <p key={sIdx} className="text-[10px] text-slate-600 font-medium bg-white p-2 rounded-xl border border-slate-200/70">
                              {formatStudentSource(src)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                    🎒
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                🤖
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-3xl rounded-tl-xs text-xs font-bold text-slate-600 flex items-center space-x-2">
                <RefreshCw size={14} className="animate-spin text-orange-500" />
                <span>GuruAI is preparing your answer... 🤔</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert with Retry */}
        {errorMsg && (
          <div className="mb-3 bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center justify-between text-red-700 text-xs font-bold">
            <div className="flex items-center space-x-2">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
            {lastQuery && (
              <button
                onClick={() => handleSendMessage(lastQuery)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold cursor-pointer transition-all shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Bottom Question Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-slate-100 flex items-center space-x-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask any question about ${selectedSubject || studentClass} syllabus or notes...`}
            disabled={isLoading}
            className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-orange-500 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
            title="Send Question"
          >
            <Send size={16} />
          </button>
        </form>

      </div>

    </div>
  );
};

export default GuruAIChat;
