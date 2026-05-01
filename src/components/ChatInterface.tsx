import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Info, MapPin, Calendar, Shield, Clock, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Sun, Moon, ClipboardList, Ban, CreditCard, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserContext } from '../types';
import { getAssistantResponse } from '../services/chatService';

export default function ChatInterface() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [wizardStep, setWizardStep] = useState<'START' | 'ELIGIBILITY' | 'VERIFY' | 'DASHBOARD'>('START');
  const [userContext, setUserContext] = useState<UserContext>({
    age: null,
    location: '',
    isConfirmed: false,
    onboardingComplete: false,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Voter Mitra! How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const ELECTION_STATES_2026 = ["West Bengal", "Tamil Nadu", "Kerala", "Assam", "Puducherry"];
  const ALL_INDIAN_STATES_UTS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const locationRegex = /^[a-zA-Z\s,]+$/;
  const isLocationValid = userContext.location.length >= 3 && locationRegex.test(userContext.location);

  const getMatchedState = () => {
    return ALL_INDIAN_STATES_UTS.find(state =>
      userContext.location.toLowerCase().includes(state.toLowerCase())
    );
  };

  const matchedState = getMatchedState();
  const isElectionState = matchedState && ELECTION_STATES_2026.includes(matchedState);

  const handleNextStep = () => {
    if (wizardStep === 'START') {
      if (userContext.age !== null && isLocationValid) {
        setWizardStep('ELIGIBILITY');
      }
    } else if (wizardStep === 'ELIGIBILITY') {
      setWizardStep('VERIFY');
    } else if (wizardStep === 'VERIFY') {
      if (userContext.isConfirmed) {
        setWizardStep('DASHBOARD');
        setUserContext(p => ({ ...p, onboardingComplete: true }));
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsLoading(true);

    const responseContent = await getAssistantResponse([...messages, userMessage]);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const isEligible = userContext.age !== null && userContext.age >= 18;

  return (
    <div className={`flex flex-col h-screen p-4 md:p-8 overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100 font-sans' : 'bg-slate-100 text-slate-900 font-sans'}`} id="app-wrapper">
      <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6 shrink-0" role="banner">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/40" aria-hidden="true">
              <Shield size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Voter Mitra</h1>
              <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-[0.2em] italic">Step-by-Step Election Assistant 2026</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Quick Actions">
            <div className="hidden sm:flex items-center gap-3">
              <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-400 shadow-sm flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span> Network Active
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-full transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={() => {
                setWizardStep('START');
                setUserContext({ age: null, location: '', isConfirmed: false, onboardingComplete: false });
                setMessages([{ id: '1', role: 'assistant', content: 'Resetting your journey...', timestamp: Date.now() }]);
              }}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-full transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Restart Journey"
              title="Restart"
            >
              <RefreshCw size={20} />
            </button>
          </nav>
        </header>

        {/* Wizard Content */}
        <main className="flex-grow flex flex-col items-center justify-start py-4 overflow-y-auto no-scrollbar" role="main" aria-live="polite">
          <AnimatePresence mode="wait">
            {/* STEP 1: START */}
            {wizardStep === 'START' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 font-sans"
              >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Welcome Citizen</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 font-medium italic">Begin your voting journey with a few details.</p>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="age-input" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">How old are you?</label>
                    <input
                      id="age-input"
                      type="number"
                      placeholder="E.g. 21"
                      aria-required="true"
                      value={userContext.age ?? ''}
                      onChange={(e) => setUserContext(p => ({ ...p, age: parseInt(e.target.value) || null }))}
                      className="w-full py-4 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium dark:text-white shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="location-input" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Voter Location</label>
                      {matchedState && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-[9px] font-black uppercase flex items-center gap-1 ${isElectionState ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-400'
                            }`}
                        >
                          <CheckCircle2 size={10} />
                          {isElectionState ? '2026 Election State' : 'Region Identified'}
                        </motion.span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="location-input"
                        type="text"
                        placeholder="E.g. Chennai, Tamil Nadu"
                        aria-required="true"
                        value={userContext.location}
                        onChange={(e) => setUserContext(p => ({ ...p, location: e.target.value }))}
                        className={`w-full py-4 px-6 bg-slate-50 dark:bg-slate-950 border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium dark:text-white shadow-sm ${userContext.location.length > 0 && !isLocationValid
                            ? 'border-red-500 dark:border-red-900/50'
                            : isElectionState
                              ? 'border-green-200 dark:border-green-900/50'
                              : matchedState
                                ? 'border-blue-200 dark:border-blue-900/50'
                                : 'border-slate-200 dark:border-slate-800'
                          }`}
                      />
                      <MapPin size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" />
                    </div>

                    {!isLocationValid && userContext.location.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-2 ml-1"
                      >
                        {userContext.location.length < 3
                          ? "Please enter at least 3 characters."
                          : !locationRegex.test(userContext.location)
                            ? "Numbers or special characters are not allowed as place names."
                            : "Location not specifically recognized in our Indian database."}
                      </motion.p>
                    )}

                    {userContext.location.length >= 3 && !matchedState && locationRegex.test(userContext.location) && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-2 ml-1 italic"
                      >
                        Tip: Include your state name (e.g., 'Jaipur, Rajasthan') for better recognition.
                      </motion.p>
                    )}

                    <div className="mt-4">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Priority 2026 States</p>
                      <div className="flex flex-wrap gap-2">
                        {ELECTION_STATES_2026.map(state => (
                          <button
                            key={state}
                            onClick={() => setUserContext(p => ({ ...p, location: state }))}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${userContext.location.includes(state)
                                ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-orange-200'
                              }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!userContext.age || !isLocationValid}
                    onClick={handleNextStep}
                    className="w-full py-5 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-slate-200 dark:shadow-orange-950/20 hover:bg-slate-800 dark:hover:bg-orange-700 disabled:opacity-30 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                  >
                    Continue Journey <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ELIGIBILITY */}
            {wizardStep === 'ELIGIBILITY' && (
              <motion.div
                key="eligibility"
                role="region"
                aria-labelledby="eligibility-title"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-xl flex flex-col items-center"
              >
                <div className={`w-full p-10 rounded-[3rem] border-2 flex flex-col items-center text-center ${isEligible
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30'
                    : 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30'
                  }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${isEligible ? 'bg-green-600 text-white shadow-green-100 dark:shadow-green-950/20' : 'bg-orange-500 text-white shadow-orange-100 dark:shadow-orange-950/20'
                    }`} aria-hidden="true">
                    {isEligible ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                  </div>
                  <h2 id="eligibility-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                    {isEligible ? 'You are Eligible!' : 'Future Voter Found'}
                  </h2>
                  <p className="text-slate-700 dark:text-slate-400 font-medium leading-relaxed mb-8">
                    {isEligible
                      ? `Based on your age (${userContext.age}), you meet the primary requirement for voting in India. Ensure you are a current resident of ${userContext.location}.`
                      : `At age ${userContext.age}, you aren't eligible to vote yet. However, you can pre-register starting at age 17 to get on the roll as soon as you turn 18!`}
                  </p>
                  <section className="w-full bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl text-left border border-white dark:border-slate-800 transition-colors" aria-label="Key Facts">
                    <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">Key Fact</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                      Eligibility requires being 18+ on the qualifying date (Jan 1, Apr 1, Jul 1, or Oct 1).
                    </p>
                  </section>
                </div>
                <button
                  onClick={handleNextStep}
                  className="mt-8 w-full py-5 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 dark:shadow-orange-950/20 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                  aria-label="Proceed to Identity Verification"
                >
                  Proceed to Verification
                </button>
              </motion.div>
            )}

            {/* STEP 3: VERIFY */}
            {wizardStep === 'VERIFY' && (
              <motion.div
                key="verify"
                role="form"
                aria-labelledby="verify-title"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-black/40 transition-colors"
              >
                <h2 id="verify-title" className="text-2xl font-black text-slate-900 dark:text-white mb-2">Details Confirmation</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-10 font-medium italic">This is a simulation. No sensitive data is collected.</p>

                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors" aria-label="Supplied Information Review">
                    <div className="flex justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Calculated Age</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{userContext.age} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Voter Location</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{userContext.location}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.label
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        backgroundColor: userContext.isConfirmed ? (theme === 'dark' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(234, 88, 12, 0.05)') : 'transparent',
                        borderColor: userContext.isConfirmed ? '#ea580c' : (theme === 'dark' ? '#1e293b' : '#f1f5f9')
                      }}
                      className="flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden focus-within:ring-2 focus-within:ring-orange-500"
                    >
                      {userContext.isConfirmed && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          className="absolute top-3 right-3 text-orange-600"
                          aria-hidden="true"
                        >
                          <CheckCircle2 size={18} />
                        </motion.div>
                      )}
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 bg-transparent cursor-pointer"
                        checked={userContext.isConfirmed}
                        onChange={(e) => setUserContext(p => ({ ...p, isConfirmed: e.target.checked }))}
                        aria-label="Confirm Identity Declaration"
                      />
                      <div>
                        <p className={`text-sm font-bold leading-none mb-2 transition-colors ${userContext.isConfirmed ? 'text-orange-600' : 'text-slate-900 dark:text-slate-200'}`}>Identity Declaration</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">I confirm that I am a citizen of India and the details provided are accurate for educational purposes.</p>
                      </div>
                    </motion.label>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl flex items-start gap-3 border border-orange-100 dark:border-orange-900/30 transition-colors" role="alert">
                      <Info size={16} className="text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-[10px] text-orange-800 dark:text-orange-400 font-bold leading-relaxed italic uppercase tracking-wider">
                        Demo Note: Never enter real Aadhaar or ID details on third-party educational apps.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!userContext.isConfirmed}
                    onClick={handleNextStep}
                    className="w-full py-5 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl disabled:opacity-30 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                  >
                    Generate My Guide Dashboard
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DASHBOARD */}
            {wizardStep === 'DASHBOARD' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 overflow-y-auto no-scrollbar"
                role="region"
                aria-label="Voting Guide Dashboard"
              >
                {/* Guidance Info */}
                <div className="col-span-1 md:col-span-8 space-y-6">
                  <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-colors" aria-labelledby="guide-title">
                    <div className="flex items-center justify-between mb-8">
                      <h2 id="guide-title" className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Your Voting Guide</h2>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-950/50 rounded-full text-green-800 dark:text-green-400 text-[10px] font-black uppercase tracking-widest" aria-label="Support Status">
                        <Clock size={12} aria-hidden="true" /> Live Support
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: <Shield size={18} />, t: "1. Register Online", d: "Go to VoterPortal.eci.gov.in and fill Form 6 to get registered.", c: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" },
                        { icon: <Info size={18} />, t: "2. Verify Slip", d: "Check your name in the electoral roll and collect your voter info slip.", c: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" },
                        { icon: <MapPin size={18} />, t: "3. Locate Booth", d: "Use the Voter Helpline App to find your assigned polling booth.", c: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" },
                        { icon: <Bot size={18} />, t: "4. Cast Vote", d: "Present your ID, get inked, and use the EVM machine to vote.", c: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400" }
                      ].map((step, i) => (
                        <article key={i} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all group focus:outline-none focus:ring-2 focus:ring-orange-500" tabIndex={0}>
                          <div className={`w-10 h-10 rounded-xl ${step.c} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`} aria-hidden="true">
                            {step.icon}
                          </div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 mb-2">{step.t}</h3>
                          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{step.d}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* Upcoming Phases Section */}
                  <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-colors" aria-labelledby="phases-title">
                    <div className="flex items-center justify-between mb-6">
                      <h2 id="phases-title" className="text-lg font-black text-slate-900 dark:text-white tracking-tight">2026 Election Calendar</h2>
                      <div className="px-3 py-1 bg-orange-100 dark:bg-orange-950/50 rounded-full text-orange-700 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-900/30">
                        Multi-Phase Schedule
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { p: "Phase 1", d: "Apr 25, 2026", l: "Assam & Bengal (I)", s: "Completed", status: 'past' },
                        { p: "Phase 2", d: "May 02, 2026", l: "Kerala, TN, PY", s: "In 2 Days", status: 'upcoming' },
                        { p: "Phase 3", d: "May 12, 2026", l: "West Bengal (III)", s: "Scheduled", status: 'future' },
                        { p: "Phase 4", d: "May 20, 2026", l: "West Bengal (IV)", s: "Scheduled", status: 'future' },
                        { p: "Phase 5", d: "May 28, 2026", l: "West Bengal (V)", s: "Scheduled", status: 'future' },
                        { p: "Counting", d: "Jun 05, 2026", l: "Results Day", s: "Mandate 2026", status: 'future' }
                      ].map((item, i) => (
                        <div key={i} className={`flex flex-col p-5 rounded-2xl border transition-all cursor-default relative overflow-hidden group ${item.status === 'upcoming'
                            ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-200/50 dark:shadow-orange-950/30 ring-2 ring-orange-500 ring-offset-4 dark:ring-offset-slate-950'
                            : item.status === 'past'
                              ? 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 opacity-60'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                          }`} tabIndex={0}>
                          {item.status === 'upcoming' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -top-6 -right-6 w-16 h-16 bg-white/20 rounded-full"
                            />
                          )}
                          <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${item.status === 'upcoming' ? 'text-orange-100' : 'text-orange-600'}`}>{item.p}</span>
                            <span className={`text-[10px] font-bold ${item.status === 'upcoming' ? 'text-white' : 'text-slate-500'}`}>{item.d}</span>
                          </div>
                          <p className={`text-xs font-bold tracking-tight mb-1 relative z-10 ${item.status === 'upcoming' ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>{item.l}</p>
                          <span className={`text-[9px] font-medium italic ${item.status === 'upcoming' ? 'text-orange-100' : 'text-slate-500 dark:text-slate-500'}`}>{item.s}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Voter Guidance & Election Day Instructions */}
                  <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-colors" aria-labelledby="voter-guidance-title">
                    <div className="flex flex-col mb-8">
                      <h2 id="voter-guidance-title" className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Voter Guidance & Election Day Instructions</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Please carefully review the following important information before proceeding to vote:</p>
                    </div>

                    <div className="space-y-6">
                      {/* 1. Election Details & Documents */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <article className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-xl text-orange-600 dark:text-orange-400">
                              <Calendar size={20} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">📅 Election Details</h3>
                          </div>
                          <ul className="space-y-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <li className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                              <span>Election Date(s)</span>
                              <span className="text-slate-900 dark:text-white">As per local Phase</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                              <span>Polling Time</span>
                              <span className="text-slate-900 dark:text-white">7:00 AM to 6:00 PM</span>
                            </li>
                            <li className="flex flex-col gap-1">
                              <span>Polling Booth Location</span>
                              <span className="text-blue-600 dark:text-blue-400">Refer to your Voter Info Slip</span>
                            </li>
                          </ul>
                        </article>

                        <article className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                              <CreditCard size={20} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">🪪 Mandatory Documents</h3>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 mb-3 leading-relaxed uppercase tracking-wider">Required for smooth entry:</p>
                          <ul className="space-y-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>Voter ID Card (EPIC)</li>
                            <li>OR Govt Photo ID (Aadhaar, Passport, DL, etc.)</li>
                            <li>Voter Slip / Acknowledgement Paper</li>
                          </ul>
                        </article>
                      </div>

                      {/* 2. Checklist & Rules */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <article className="p-6 bg-green-50/50 dark:bg-green-950/10 rounded-[2rem] border border-green-100/50 dark:border-green-900/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-950/40 rounded-xl text-green-600 dark:text-green-400">
                              <ClipboardList size={20} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">📄 Pre-Voting Checklist</h3>
                          </div>
                          <ul className="space-y-3 text-[10px] font-bold text-slate-700 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-green-600 shrink-0 mt-0.5" />
                              <span>Confirm name in Electoral Roll</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-green-600 shrink-0 mt-0.5" />
                              <span>Know your Serial Number / Voter ID</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-green-600 shrink-0 mt-0.5" />
                              <span>Plan travel to Polling Station in advance</span>
                            </li>
                          </ul>
                        </article>

                        <article className="p-6 bg-slate-900 rounded-[2rem] text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-600 rounded-xl">
                              <Scale size={20} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest">✅ Rules at Booth</h3>
                          </div>
                          <ul className="space-y-2 text-[10px] font-medium leading-relaxed opacity-90">
                            <li>• Maintain secrecy of your vote choice</li>
                            <li>• No mobile phones inside voting compartments</li>
                            <li>• Follow instructions given by polling officers</li>
                            <li>• Respect other voters and queue protocols</li>
                            <li>• Ink marking is mandatory after voting</li>
                          </ul>
                        </article>
                      </div>

                      {/* 3. Restrictions */}
                      <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-[2rem] border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-3 mb-4 text-red-700 dark:text-red-400">
                          <Ban size={20} />
                          <h3 className="text-xs font-black uppercase tracking-widest">🚫 Important Restrictions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-bold text-red-800 dark:text-red-300">
                          <p>• Impersonation is a punishable offense</p>
                          <p>• No voting without valid identification</p>
                          <p>• Avoid campaigning near restricted areas</p>
                          <p>• Penalties apply for bribery or inducement</p>
                        </div>
                      </div>

                      {/* Final Reminder */}
                      <div className="p-8 bg-orange-600 rounded-[2rem] text-white text-center relative overflow-hidden group">
                        <div className="relative z-10">
                          <h3 className="text-lg font-black italic tracking-tighter mb-2">🗳️ Final Reminder</h3>
                          <p className="text-xs font-medium opacity-90 leading-relaxed max-w-lg mx-auto">
                            Voting is your right and responsibility. Ensure you are fully prepared, carry all necessary documents, and follow all rules to make the election process smooth and fair.
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-6">Thank you for participating in democracy!</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                          <Shield size={100} strokeWidth={1} />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* AI Interaction Area */}
                  <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[400px] transition-colors" aria-labelledby="ai-chat-title">
                    <header className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Bot size={16} aria-hidden="true" />
                        <span id="ai-chat-title" className="text-[10px] font-black uppercase tracking-[0.2em]">Mitra AI Advisor</span>
                      </div>
                      <span className="text-[9px] font-bold opacity-60">Verified Educational Source</span>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar" ref={scrollRef} aria-live="polite">
                      {messages.map(m => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold shadow-sm ${m.role === 'user' ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`} aria-hidden="true">
                            {m.role === 'user' ? 'YOU' : 'VM'}
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none shadow-orange-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-tl-none border border-transparent dark:border-slate-800 shadow-sm'}`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-2 p-2 justify-center" aria-label="AI is typing">
                          <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full animate-bounce" aria-hidden="true"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full animate-bounce delay-100" aria-hidden="true"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full animate-bounce delay-200" aria-hidden="true"></span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="relative">
                        <label htmlFor="chat-input" className="sr-only">Ask a question</label>
                        <input
                          id="chat-input"
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Explain NOTA? Online voting myths?"
                          className="w-full py-3 px-5 pr-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium dark:text-white"
                        />
                        <button
                          onClick={() => handleSend()}
                          className="absolute right-1.5 top-1.5 p-1.5 bg-slate-900 dark:bg-orange-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          aria-label="Send Message"
                        >
                          <Send size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar: Utils */}
                <div className="col-span-1 md:col-span-4 space-y-6">
                  <aside className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-black/20 flex flex-col items-center text-center transition-colors" aria-labelledby="locator-title">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-inner" aria-hidden="true">
                      <MapPin size={32} />
                    </div>
                    <h2 id="locator-title" className="text-base font-black text-slate-900 dark:text-white mb-3 tracking-tight">Booth Locator</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 italic">Find polling stations specifically in <br /><strong className="text-slate-900 dark:text-white">{userContext.location}</strong></p>
                    <a
                      href={`https://www.google.com/maps/search/polling+booth+near+${encodeURIComponent(userContext.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-200 dark:shadow-blue-950/20 hover:bg-blue-700 dark:hover:bg-blue-800 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                      aria-label={`Open Google Maps to find booths in ${userContext.location}`}
                    >
                      Open Smart Maps <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </aside>

                  <aside className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group" aria-labelledby="alert-title">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform" aria-hidden="true">
                      <Calendar size={120} strokeWidth={1} />
                    </div>
                    <h2 id="alert-title" className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-60">Election Alert 2026</h2>
                    <div className="text-2xl font-black italic tracking-tighter mb-1">Mega Phase (South)</div>
                    <div className="text-4xl font-black text-orange-400 mb-4 tracking-tighter">02 MAY</div>
                    <p className="text-xs font-bold opacity-80 mb-8 leading-relaxed">
                      Upcoming elections for Tamil Nadu, Kerala, and Puducherry. Polling stations open from 7:00 AM to 6:00 PM.
                    </p>
                    <a
                      href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Assembly+Elections+2026+(South+Phase)&dates=20260502T023000Z/20260502T123000Z&details=Don't+forget+your+Voter+ID+and+to+find+your+polling+booth!&location=Tamil+Nadu,+Kerala,+Puducherry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-center shadow-lg shadow-orange-950/20 hover:bg-orange-700 transition-all block focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                      aria-label="Add May 2nd election date to Google Calendar"
                    >
                      Add to Calendar
                    </a>
                  </aside>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest gap-4 shrink-0 pb-2 transition-colors" role="contentinfo">
          <div className="flex items-center gap-4">
            <span>ECI Educational Tool 2026</span>
            <span className="w-1 h-1 bg-slate-400 dark:bg-slate-700 rounded-full" aria-hidden="true"></span>
            <span className="opacity-80">Demo Application • No Data Stored</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1"><Shield size={10} aria-hidden="true" /> Secure Simulation</span>
            <span className="flex items-center gap-1 italic">Toll Free Support: 1950</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
