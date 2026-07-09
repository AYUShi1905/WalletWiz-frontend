import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  Send, Trash2, Bot, User, Loader2, Landmark, 
  CreditCard, Banknote, ShieldAlert, BadgeInfo 
} from 'lucide-react';

const Chat = () => {
  const { history, loading, error: chatError, sendMessage, clearHistory } = useChat();
  const [inputText, setInputText] = useState('');
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  // Listen to Axios rate limit (429) events globally
  useEffect(() => {
    const handleRateLimited = (e) => {
      setRateLimitMessage(e.detail?.message || 'Rate limit exceeded: 20 messages per minute.');
      // Auto-clear after 4 seconds
      setTimeout(() => {
        setRateLimitMessage('');
      }, 4000);
    };

    window.addEventListener('rate-limited', handleRateLimited);
    return () => {
      window.removeEventListener('rate-limited', handleRateLimited);
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    sendMessage(inputText.trim());
    setInputText('');
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val || 0);
  };

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment method icons
  const getPaymentIcon = (method) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Landmark className="h-4 w-4 text-emerald-400" />;
      case 'CARD':
        return <CreditCard className="h-4 w-4 text-indigo-400" />;
      case 'CASH':
      default:
        return <Banknote className="h-4 w-4 text-amber-400" />;
    }
  };

  // Receipt Card Component for log_transaction tool
  const ReceiptCard = ({ tx }) => {
    if (!tx) return null;
    return (
      <div className="mt-3 bg-white text-slate-900 border border-slate-200 rounded-xl p-4 shadow-xl font-mono text-xs w-full max-w-[260px] self-start relative overflow-hidden">
        {/* Jagged Receipt Edge Decoration (top/bottom) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent bg-[length:8px_4px]"></div>

        <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
          <span className="font-extrabold block tracking-widest text-[9px] text-slate-500">WALLETWIZ RECEIPT</span>
          <span className="text-[8px] text-slate-400 block mt-0.5">{formatDate(tx.transaction_date)}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">MERCHANT:</span>
            <span className="font-bold text-slate-800 truncate max-w-[120px]">{tx.merchant}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">CATEGORY:</span>
            <span className="font-bold text-slate-800">{tx.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">METHOD:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {tx.payment_method}
            </span>
          </div>
          {tx.description && (
            <div className="border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-[8px] text-slate-400 block">NOTES:</span>
              <p className="text-slate-600 leading-tight break-words italic">"{tx.description}"</p>
            </div>
          )}
        </div>

        <div className="border-t-2 border-dashed border-slate-300 pt-3 flex items-center justify-between text-xs font-bold text-slate-800">
          <span>TOTAL:</span>
          <span>{formatCurrency(tx.amount)}</span>
        </div>

        {/* Barcode effect */}
        <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col items-center">
          <div className="h-6 w-full flex items-center justify-center gap-[1.5px] opacity-75">
            {[2,1,3,1,2,1,1,3,2,1,2,2,1,3,1,2,1].map((w, i) => (
              <div 
                key={i} 
                className="h-full bg-slate-900" 
                style={{ width: `${w}px` }}
              ></div>
            ))}
          </div>
          <span className="text-[7px] text-slate-400 tracking-widest mt-1">*{tx.id ? tx.id.substring(0, 8).toUpperCase() : 'LOGGED'}*</span>
        </div>
      </div>
    );
  };

  // Database query summary card component
  const QueryCard = ({ filters, count }) => {
    if (!filters) return null;
    return (
      <div className="mt-3 backdrop-blur-md bg-slate-950/60 border border-slate-800 rounded-xl p-4 shadow-lg text-xs w-full max-w-[260px]">
        <div className="flex items-center gap-1.5 text-brand-accent font-bold border-b border-white/5 pb-2 mb-3">
          <BadgeInfo className="h-4 w-4" />
          <span>QUERY FILTERS</span>
        </div>

        {/* Filter badging list */}
        <div className="space-y-1.5 mb-3">
          {Object.entries(filters).map(([key, value]) => {
            if (value === null || value === undefined || value === '') return null;
            return (
              <div key={key} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-lg border border-white/5 min-w-0">
                <span className="text-[9px] text-slate-500 font-semibold uppercase">{key.replace('_', ' ')}</span>
                <span className="text-slate-300 font-bold truncate max-w-[120px] ml-2">
                  {typeof value === 'number' ? formatCurrency(value) : value.toString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-brand-accent/15 border border-brand-accent/20 text-brand-accent py-2 px-3 rounded-lg font-bold">
          <span>MATCHES:</span>
          <span className="bg-brand-accent text-white px-2 py-0.5 rounded-full text-[9px] shadow-sm">
            {count || 0}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[72vh] relative overflow-hidden">
      {/* 429 Toast Alert Banner */}
      {rateLimitMessage && (
        <div className="absolute top-2 left-2 right-2 z-50 flex items-center gap-2 p-3 bg-rose-600 text-white rounded-xl shadow-lg border border-rose-500/20 text-xs font-semibold animate-slide-down">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{rateLimitMessage}</span>
        </div>
      )}

      {/* Chat Title and Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 shrink-0 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-accent/10 p-2 rounded-xl text-brand-accent border border-brand-accent/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100">AI Assistant</h1>
            <p className="text-[10px] text-slate-500 font-semibold">Conversational database helper</p>
          </div>
        </div>
        
        {/* Reset button */}
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 font-semibold px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="bg-brand-accent/10 p-4.5 rounded-full text-brand-accent border border-brand-accent/10 shadow-inner">
              <Bot className="h-9 w-9 animate-bounce" />
            </div>
            <div className="max-w-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-200">Meet your AI Assistant</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log transactions or query details using natural statements. Try tapping one:
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "Spent 450 at Pizza Hut on UPI today",
                  "How much did I spend in total on Shopping?",
                  "List my Card transactions"
                ].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInputText(prompt)}
                    className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-accent/30 rounded-xl text-[10px] text-slate-400 hover:text-slate-200 transition-all duration-300 text-left font-medium italic"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={index} 
                  className={`flex gap-2 max-w-[85%] ${isAssistant ? 'self-start' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Bubble Avatar */}
                  <div className={`p-2 rounded-xl border shrink-0 h-8 w-8 flex items-center justify-center ${
                    isAssistant 
                      ? 'bg-slate-900/60 border-white/5 text-brand-accent' 
                      : 'bg-brand-accent/15 border-brand-accent/10 text-white'
                  }`}>
                    {isAssistant ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble Body */}
                  <div className="space-y-1">
                    <div className={`rounded-2xl py-2.5 px-3.5 text-xs leading-relaxed shadow-sm border ${
                      isAssistant 
                        ? 'bg-slate-950/20 text-slate-200 border-white/5 rounded-tl-none' 
                        : 'bg-brand-accent text-white border-brand-accent/25 rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Rendering dynamic tool result card templates */}
                    {isAssistant && msg.tool_triggered === 'log_transaction' && (msg.metadata?.transaction || msg.metadata?.query_filters) && (
                      <ReceiptCard tx={msg.metadata.transaction || msg.metadata.query_filters} />
                    )}

                    {isAssistant && msg.tool_triggered === 'query_database' && msg.metadata?.query_filters && (
                      <QueryCard filters={msg.metadata.query_filters} count={msg.metadata.results_count} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Local Error banners */}
        {chatError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{chatError}</span>
          </div>
        )}

        {/* Typing Loader animation bubble */}
        {loading && (
          <div className="flex gap-2 max-w-[85%] self-start">
            <div className="bg-slate-900/60 border border-white/5 text-brand-accent p-2 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="bg-slate-950/20 border border-white/5 rounded-2xl rounded-tl-none py-2.5 px-3.5 shadow-sm flex items-center gap-1.5">
              <Loader2 className="animate-spin h-3.5 w-3.5 text-brand-accent" />
              <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Loading...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container footer */}
      <form onSubmit={handleSend} className="pt-3 border-t border-white/10 shrink-0 bg-brand-dark">
        <div className="relative">
          <input
            type="text"
            required
            disabled={loading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Log details or query history..."
            className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-brand-accent outline-none text-xs text-slate-100 placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="absolute inset-y-1 right-1 flex items-center justify-center p-1.5 rounded-lg bg-brand-accent hover:bg-brand-accent/90 text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
