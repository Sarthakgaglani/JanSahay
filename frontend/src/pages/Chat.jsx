import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useLocationContext } from '../context/LocationContext';
import { askAssistant, submitFeedback } from '../api';

export default function Chat() {
  const { t, lang } = useLanguage();
  const { location } = useLocationContext();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('jansahay_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState(() => {
    const saved = sessionStorage.getItem('jansahay_chat_input');
    return saved ? saved : '';
  });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const processedQueryRef = useRef(null);
  const queryParam = searchParams.get('q');
  
  // Sync messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('jansahay_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Sync input to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('jansahay_chat_input', input);
  }, [input]);

  // Parse initial query from home page search
  useEffect(() => {
    if (queryParam && queryParam !== processedQueryRef.current) {
      processedQueryRef.current = queryParam;
      setMessages([]);
      sessionStorage.setItem('jansahay_chat_messages', '[]');
      handleSend(queryParam);
    }
  }, [queryParam]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Capture history before appending new user message
    const history = messages.map(m => ({ sender: m.sender, text: m.text }));

    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAssistant(text, lang, history, location.state);
      
      const assistantMsg = {
        id: Date.now() + 1,
        text: response.answer,
        sources: response.sources || [],
        sender: 'assistant',
        helpful: null // state of thumb up/down
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error connecting to the service. Please try again.",
        sender: 'assistant',
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgId, helpful) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, helpful };
      }
      return m;
    }));

    const msg = messages.find(m => m.id === msgId);
    const userQuery = messages.find(m => m.sender === 'user' && m.id < msgId)?.text || '';
    
    try {
      await submitFeedback(userQuery, helpful);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  // Text-to-Speech (TTS)
  const handleSpeak = (text, msgId) => {
    if ('speechSynthesis' in window) {
      // If currently speaking this message, stop it
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }
      
      window.speechSynthesis.cancel(); // Stop any other speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 
                       lang === 'gu' ? 'gu-IN' : 
                       lang === 'ta' ? 'ta-IN' : 
                       lang === 'te' ? 'te-IN' : 
                       lang === 'bn' ? 'bn-IN' : 
                       lang === 'mr' ? 'mr-IN' : 'en-IN';
                       
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      setSpeakingMessageId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Input for follow-up question
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 
                       lang === 'gu' ? 'gu-IN' : 
                       lang === 'ta' ? 'ta-IN' : 
                       lang === 'te' ? 'te-IN' : 
                       lang === 'bn' ? 'bn-IN' : 
                       lang === 'mr' ? 'mr-IN' : 'en-IN';
                       
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setInput(resultText);
    };

    recognition.start();
  };

  const getPortalColor = (portal) => {
    switch (portal) {
      case 'pmkisan': return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800';
      case 'pmjay': return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
      case 'scholarships': return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
      case 'eshram': return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
      case 'pmjdy': return 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-2xl mx-auto text-3xl mb-4">
                💬
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                How can JanSahay AI help you today?
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Ask about agricultural support, student scholarships, healthcare cards, or labor insurance schemes.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm border transition-all ${
                m.sender === 'user'
                  ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none'
                  : m.isError
                    ? 'bg-red-50 border-red-200 text-red-900 rounded-tl-none dark:bg-red-950/20 dark:border-red-900 dark:text-red-300'
                    : 'bg-white border-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-800 dark:border-gray-700/60 dark:text-gray-100'
              }`}>
                {/* Text Content */}
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>
                
                {/* TTS / Sound Button for Assistant */}
                {m.sender === 'assistant' && !m.isError && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-2 text-xs text-gray-400">
                    <button
                      onClick={() => handleSpeak(m.text, m.id)}
                      className="inline-flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                    >
                      <span>🔊</span>
                      <span>{speakingMessageId === m.id ? t.ttsStop : t.ttsSpeak}</span>
                    </button>
                    
                    {/* Feedback area */}
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400">{t.feedbackHelpful}</span>
                      <button
                        onClick={() => handleFeedback(m.id, true)}
                        className={`hover:scale-110 transition-transform ${m.helpful === true ? 'text-green-500 font-bold' : ''}`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleFeedback(m.id, false)}
                        className={`hover:scale-110 transition-transform ${m.helpful === false ? 'text-red-500 font-bold' : ''}`}
                      >
                        👎
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Source Cards Grid */}
              {m.sender === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="mt-3 w-full max-w-[85%] grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                  {m.sources.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm transition-all ${getPortalColor(s.portal)}`}
                    >
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border border-current uppercase">
                          {s.portal}
                        </span>
                        <h4 className="mt-2 text-xs sm:text-sm font-bold truncate">
                          {s.scheme_name}
                        </h4>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {t.source} &rarr;
                        </a>
                        {s.apply_url && (
                          <a
                            href={s.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-white border dark:bg-gray-900 border-current rounded-lg shadow-sm hover:scale-105 transition-all"
                          >
                            Apply
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking Loading State */}
          {loading && (
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl px-5 py-4 max-w-[50%] rounded-tl-none">
              <div className="flex space-x-1">
                <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {t.thinking}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300 py-4 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="max-w-3xl mx-auto flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-100 dark:border-gray-700/80"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm sm:text-base py-2 text-gray-900 dark:text-white"
            disabled={loading}
          />
          
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'hover:bg-gray-200 text-gray-500 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            disabled={loading}
            title="Voice Input"
          >
            🎙️
          </button>
          
          <button
            type="submit"
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            disabled={!input.trim() || loading}
          >
            🚀
          </button>
        </form>
      </div>

    </div>
  );
}
