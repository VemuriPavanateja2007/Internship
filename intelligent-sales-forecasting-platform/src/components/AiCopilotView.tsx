import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  TrendingUp, 
  Target, 
  ShieldAlert, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { CopilotMessage, ForecastResponse, DealPipelineResponse } from '../types';

interface AiCopilotViewProps {
  forecastData: ForecastResponse | null;
  pipelineData: DealPipelineResponse | null;
  onAskCopilot: (question: string) => Promise<string>;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  forecastData,
  pipelineData,
  onAskCopilot,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your AI Sales Forecasting Copilot, powered by Gemini 2.5 Flash and real-time Scikit-Learn predictive modeling. I have full context on your ${forecastData?.summary.horizonMonths || 6}-month revenue projections, pipeline win probabilities, and scenario sensitivities. How can I assist your sales leadership team today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const quickPrompts = [
    "What is driving our revenue growth in the next 6 months?",
    "Which pipeline deals have the highest risk of slipping?",
    "How can we close our target quota gap most effectively?",
    "How does a 15% increase in lead generation impact our year-end run rate?",
    "Give me 3 tactical recommendations for deals in the 'Negotiation' stage.",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isThinking) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const aiResponse = await onAskCopilot(query);
      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I encountered an error analyzing the current forecasting model. Please check the network connection and retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0F0F12] text-white rounded-lg p-5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold uppercase tracking-tight">
                Sales AI Copilot & Revenue Advisor
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Query time-series projections, pipeline deal risks, model weights, and growth opportunities with LLM reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-[#0F0F12] rounded-lg border border-white/10 flex flex-col h-[540px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    isAi
                      ? 'bg-white/5 border border-white/10 text-slate-200'
                      : 'bg-indigo-500 text-white font-medium'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line text-xs">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-2 font-mono ${
                      isAi ? 'text-slate-500' : 'text-indigo-200'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5 font-bold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-slate-400 flex items-center gap-2 font-mono">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Gemini 2.5 Flash analyzing forecast context & scikit-learn models...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white/5 border-t border-white/10 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[10px] font-mono bg-[#09090B] hover:bg-white/10 text-slate-400 hover:text-white px-2.5 py-1 rounded border border-white/10 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#0F0F12] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask the Sales AI Copilot (e.g., 'How can we increase Q4 revenue by 20%?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#09090B] border border-white/10 text-xs rounded px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white p-2 rounded transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
