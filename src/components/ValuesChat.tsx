import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { trackChatEngaged, trackBookingSubmitted } from '@/lib/analytics';

type Msg = { role: 'user' | 'assistant'; content: string };

interface DisplayMsg extends Msg {
  question?: string;
}

interface ParsedMessage {
  body: string;
  question?: string;
  options?: string[];
}

type Phase = 'reflect' | 'discover' | 'book' | 'complete';

interface ProgressState {
  step: number;
  phase: Phase;
}

// Parse the <!-- STEP:N PHASE:xxx --> marker from assistant content
function extractProgressMarker(content: string): ProgressState | null {
  const match = content.match(/<!--\s*STEP:(\d+)\s+PHASE:(\w+)\s*-->/);
  if (!match) return null;
  const step = parseInt(match[1], 10);
  const phase = match[2] as Phase;
  if (isNaN(step) || !['reflect', 'discover', 'book', 'complete'].includes(phase)) return null;
  return { step, phase };
}

// Strip progress marker from display content
function stripProgressMarker(content: string): string {
  return content.replace(/<!--\s*STEP:\d+\s+PHASE:\w+\s*-->/g, '').trim();
}

// Fallback: infer progress from user message count
function inferProgressFromMessageCount(userMsgCount: number): ProgressState {
  if (userMsgCount <= 0) return { step: 1, phase: 'reflect' };
  if (userMsgCount <= 8) return { step: userMsgCount, phase: 'reflect' };
  if (userMsgCount <= 13) return { step: userMsgCount, phase: 'discover' };
  if (userMsgCount <= 20) return { step: userMsgCount, phase: 'book' };
  return { step: 21, phase: 'complete' };
}

// Phase config
const PHASES: { key: Phase; label: string; stepRange: [number, number] }[] = [
  { key: 'reflect', label: 'Reflect', stepRange: [1, 8] },
  { key: 'discover', label: 'Discover', stepRange: [9, 13] },
  { key: 'book', label: 'Book', stepRange: [14, 21] },
];

function getPhaseProgress(progress: ProgressState, phaseKey: Phase): 'future' | 'active' | 'complete' {
  const phaseOrder: Phase[] = ['reflect', 'discover', 'book', 'complete'];
  const currentIdx = phaseOrder.indexOf(progress.phase);
  const targetIdx = phaseOrder.indexOf(phaseKey);

  if (progress.phase === 'complete') return 'complete';
  if (targetIdx < currentIdx) return 'complete';
  if (targetIdx === currentIdx) return 'active';
  return 'future';
}

function getPhasePercent(progress: ProgressState, phase: { key: Phase; stepRange: [number, number] }): number {
  const status = getPhaseProgress(progress, phase.key);
  if (status === 'complete') return 100;
  if (status === 'future') return 0;
  // Active phase — calculate internal progress
  const [start, end] = phase.stepRange;
  const range = end - start + 1;
  const stepsIn = Math.max(0, Math.min(progress.step - start, range));
  return Math.round((stepsIn / range) * 100);
}

// Progress bar component
const ChatProgressBar: React.FC<{ progress: ProgressState }> = ({ progress }) => {
  return (
    <div className="chat-progress">
      <div className="chat-progress-track">
        {PHASES.map((phase, i) => {
          const status = getPhaseProgress(progress, phase.key);
          const percent = getPhasePercent(progress, phase);
          const isLast = i === PHASES.length - 1;

          return (
            <React.Fragment key={phase.key}>
              {/* Node */}
              <div className={`chat-progress-node ${status === 'complete' ? 'is-complete' : status === 'active' ? 'is-active' : 'is-future'}`}>
                <div className="chat-progress-node-dot">
                  {status === 'complete' && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="chat-progress-label">{phase.label}</span>
              </div>

              {/* Connecting segment */}
              {!isLast && (
                <div className="chat-progress-segment">
                  <div className="chat-progress-segment-fill" style={{ width: `${status === 'complete' ? 100 : status === 'active' ? percent : 0}%` }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

function parseAssistantMessage(content: string): ParsedMessage {
  // Strip progress marker first
  const clean = stripProgressMarker(content);
  const optionsRegex = /```options\s*\n\s*QUESTION:\s*(.+?)\n([\s\S]*?)```/;
  const match = clean.match(optionsRegex);
  
  if (!match) {
    return { body: clean };
  }

  const body = clean.slice(0, match.index).trim();
  const question = match[1].trim();
  const optionLines = match[2]
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).trim());

  return { body, question, options: optionLines.length > 0 ? optionLines : undefined };
}

function extractBookingSummary(content: string): Record<string, string> | null {
  const fields: Record<string, string> = {};
  const patterns: [string, RegExp][] = [
    ['session_type', /\*\*Session Type:\*\*\s*(.+)/i],
    ['offering', /\*\*Offering:\*\*\s*(.+)/i],
    ['date_time', /\*\*Date & Time:\*\*\s*(.+)/i],
    ['participant_role', /\*\*Participant Role:\*\*\s*(.+)/i],
    ['intention', /\*\*Intention:\*\*\s*(.+)/i],
    ['name', /\*\*Name:\*\*\s*(.+)/i],
    ['contact_preference', /\*\*Contact Preference:\*\*\s*(.+)/i],
    ['core_values', /\*\*Core Values:\*\*\s*(.+)/i],
    ['value_explored', /\*\*Value Explored:\*\*\s*(.+)/i],
    ['insight', /\*\*Insight:\*\*\s*(.+)/i],
    ['desired_outcome', /\*\*Desired Outcome:\*\*\s*(.+)/i],
    ['notes', /\*\*Notes:\*\*\s*(.+)/i],
  ];

  for (const [key, regex] of patterns) {
    const match = content.match(regex);
    if (match) fields[key] = match[1].trim();
  }

  if (fields.name && (fields.session_type || fields.offering)) return fields;
  return null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/values-chat`;
const NOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;

interface ValuesChatProps {
  rolledValue: string;
  rolledContext: string;
  coreValues?: string[];
  onTriggerProductPopup?: () => void;
}

export const ValuesChat: React.FC<ValuesChatProps> = ({ rolledValue, rolledContext, coreValues, onTriggerProductPopup }) => {
  const [apiMessages, setApiMessages] = useState<Msg[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ step: 0, phase: 'reflect' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const popupTriggeredRef = useRef(false);
  const bookingSavedRef = useRef(false);
  const lastQuestionRef = useRef<string | null>(null);

  // Count user messages for fallback progress
  const userMsgCount = useMemo(
    () => displayMessages.filter(m => m.role === 'user' && !m.content.startsWith('Rolled:')).length,
    [displayMessages]
  );

  useEffect(() => {
    if (rolledValue && rolledContext && !hasStarted) {
      setHasStarted(true);
      setApiMessages([]);
      setDisplayMessages([]);
      setProgress({ step: 1, phase: 'reflect' });
      startConversation();
    }
  }, [rolledValue, rolledContext]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const exportConversation = () => {
    if (displayMessages.length === 0) return;
    
    const lines = [
      "═══════════════════════════════════════",
      "       WORDS INCARNATE — VALUES REFLECTION",
      "═══════════════════════════════════════",
      "",
      `Value: ${rolledValue}`,
      `Context: ${rolledContext}`,
      `Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      "",
      "───────────────────────────────────────",
      "",
    ];

    displayMessages.forEach((msg) => {
      if (msg.content.startsWith("Rolled:")) return;
      const parsed = msg.role === "assistant" ? parseAssistantMessage(msg.content) : null;
      const label = msg.role === "user" ? "YOU" : "VALUES COACH";
      lines.push(`[${label}]`);
      if (msg.role === 'user' && msg.question) {
        lines.push(`Q: ${msg.question}`);
        lines.push(`A: ${msg.content}`);
      } else {
        lines.push(parsed ? parsed.body : msg.content);
      }
      if (parsed?.question) {
        lines.push("");
        lines.push(`Question: ${parsed.question}`);
        if (parsed.options) {
          parsed.options.forEach((opt) => lines.push(`  • ${opt}`));
        }
      }
      lines.push("");
    });

    lines.push("───────────────────────────────────────");
    lines.push("Exported from Words Incarnate");
    lines.push("wordsincarnate.com");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `values-reflection-${rolledValue.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveBooking = async (summary: Record<string, string>) => {
    if (bookingSavedRef.current) return;
    bookingSavedRef.current = true;

    const bookingData = {
      name: summary.name || null,
      contact_method: summary.contact_preference?.split('(')[0]?.trim() || null,
      contact_info: summary.contact_preference?.match(/\(([^)]+)\)/)?.[1] || null,
      customer_type: summary.participant_role || null,
      intention: summary.intention || null,
      support_type: null,
      offering: summary.session_type || summary.offering || null,
      timing: summary.date_time || null,
      desired_outcome: summary.desired_outcome || null,
      value_explored: summary.value_explored || rolledValue,
      context_explored: rolledContext,
      insight: summary.insight || null,
      core_values: coreValues || [],
      raw_summary: summary,
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      await fetch(`${supabaseUrl}/rest/v1/chat_bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(bookingData),
      });

      await fetch(NOTIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          type: 'booking',
          data: { ...bookingData, raw_summary: summary },
        }),
      });

      trackBookingSubmitted();
    } catch (e) {
      console.error('Failed to save booking:', e);
    }
  };

  const streamChat = async (msgs: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: msgs,
        rolledValue,
        rolledContext,
        coreValues: coreValues || [],
      }),
    });

    if (!resp.ok || !resp.body) {
      const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errData.error || `Error ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantSoFar = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            const updateFn = (prev: DisplayMsg[]) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: 'assistant' as const, content: assistantSoFar }];
            };
            setDisplayMessages(updateFn);
            setApiMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: 'assistant' as const, content: assistantSoFar }];
            });
            scrollToBottom();

            if (!popupTriggeredRef.current && assistantSoFar.includes('At Words Incarnate, everything we create')) {
              popupTriggeredRef.current = true;
              onTriggerProductPopup?.();
            }

            const latestParsed = parseAssistantMessage(assistantSoFar);
            if (latestParsed.question) {
              lastQuestionRef.current = latestParsed.question;
            }

            // Update progress from LLM marker (primary)
            const marker = extractProgressMarker(assistantSoFar);
            if (marker) {
              setProgress(marker);
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final progress update: prefer LLM marker, fall back to message count
    const finalMarker = extractProgressMarker(assistantSoFar);
    if (finalMarker) {
      setProgress(finalMarker);
    } else {
      // Fallback: will use current userMsgCount + 1 on next render
      const currentUserCount = displayMessages.filter(m => m.role === 'user' && !m.content.startsWith('Rolled:')).length;
      setProgress(inferProgressFromMessageCount(currentUserCount));
    }

    const summary = extractBookingSummary(assistantSoFar);
    if (summary) {
      saveBooking(summary);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const initMsgs: Msg[] = [{ role: 'user', content: `I just rolled the value "${rolledValue}" with the context "${rolledContext}". Begin the reflection.` }];
      const rolledMsg: DisplayMsg = { role: 'user', content: `Rolled: ${rolledValue} × ${rolledContext}` };
      setApiMessages([rolledMsg]);
      setDisplayMessages([rolledMsg]);
      await streamChat(initMsgs);
    } catch (e) {
      console.error(e);
      const errMsg: DisplayMsg = { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try rolling again.' };
      setDisplayMessages(prev => [...prev, errMsg]);
      setApiMessages(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    // Track first user-initiated message
    if (apiMessages.filter(m => m.role === 'user').length === 0) {
      trackChatEngaged();
    }

    const displayMsg: DisplayMsg = {
      role: 'user',
      content: msgText,
      question: lastQuestionRef.current || undefined,
    };
    const apiMsg: Msg = { role: 'user', content: msgText };

    const newDisplayMessages = [...displayMessages, displayMsg];
    const newApiMessages = [...apiMessages, apiMsg];
    setDisplayMessages(newDisplayMessages);
    setApiMessages(newApiMessages);
    setInput('');
    setIsLoading(true);
    lastQuestionRef.current = null;
    scrollToBottom();

    try {
      await streamChat(newApiMessages.filter(m => m.content && !m.content.startsWith('Rolled:')));
    } catch (e) {
      console.error(e);
      const errMsg: DisplayMsg = { role: 'assistant', content: 'Something went wrong. Please try again.' };
      setDisplayMessages(prev => [...prev, errMsg]);
      setApiMessages(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const handleOptionClick = (option: string) => {
    sendMessage(option);
  };

  if (!rolledValue || !rolledContext) {
    return (
      <div className="chat-container chat-empty-state">
        <div className="chat-empty-icon">
          <Sparkles className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-serif text-lg text-foreground/60 italic">Roll the dice to begin</p>
        <p className="text-[0.6rem] font-mono mt-3 max-w-[240px] text-muted-foreground tracking-[0.15em] uppercase text-center">
          Your coach will guide a Socratic exploration of your values
        </p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="chat-header-icon">
              <Sparkles className="w-3 h-3" />
            </div>
            <h3 className="font-serif text-lg text-foreground tracking-wide">Values Coach</h3>
          </div>
          {displayMessages.length > 1 && (
            <button
              onClick={exportConversation}
              className="chat-export-btn"
              title="Export conversation"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {hasStarted && <ChatProgressBar progress={progress} />}

        <div className="chat-header-badge">
          <span className="text-[0.55rem] font-mono tracking-[0.15em] uppercase text-muted-foreground">Exploring</span>
          <span className="font-serif text-sm text-foreground font-medium">{rolledValue}</span>
          <span className="text-muted-foreground text-xs">×</span>
          <span className="font-serif text-sm ink-red italic">{rolledContext}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="chat-messages">
        {displayMessages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === displayMessages.length - 1;
          const parsed = msg.role === 'assistant' ? parseAssistantMessage(msg.content) : null;
          const showOptions = isLastAssistant && !isLoading && parsed?.options;
          const isRolledBadge = msg.content.startsWith('Rolled:');

          if (isRolledBadge) return null;

          return (
            <div key={i} className="chat-msg-group">
              {msg.role === 'user' && (
                <div className="chat-msg-user-wrap">
                  <div className="chat-msg-user">
                    {msg.question ? (
                      <div className="chat-qa-block">
                        <div className="chat-qa-question">
                          <span className="chat-qa-label">Q:</span>
                          <span>{msg.question}</span>
                        </div>
                        <div className="chat-qa-answer">
                          <span className="chat-qa-label">A:</span>
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              )}

              {msg.role === 'assistant' && (
                <div className="chat-msg-assistant-wrap">
                  <div className="chat-msg-assistant">
                    <div className="prose-sketch max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>
                        {parsed ? parsed.body : stripProgressMarker(msg.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {showOptions && parsed?.question && (
                <div className="chat-options-block">
                  <p className="chat-options-question">{parsed.question}</p>
                  <div className="chat-options-list">
                    {parsed.options!.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => handleOptionClick(opt)}
                        className="chat-option-btn"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && displayMessages[displayMessages.length - 1]?.role !== 'assistant' && (
          <div className="chat-msg-assistant-wrap">
            <div className="chat-typing-indicator">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
              <span className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="chat-input-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your own answer..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-send-btn"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
