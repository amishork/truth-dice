import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

// A display message can carry extra metadata for Q/A rendering
interface DisplayMsg extends Msg {
  question?: string; // The question this answer responded to
}

interface ParsedMessage {
  body: string;
  question?: string;
  options?: string[];
}

function parseAssistantMessage(content: string): ParsedMessage {
  const optionsRegex = /```options\s*\n\s*QUESTION:\s*(.+?)\n([\s\S]*?)```/;
  const match = content.match(optionsRegex);
  
  if (!match) {
    return { body: content };
  }

  const body = content.slice(0, match.index).trim();
  const question = match[1].trim();
  const optionLines = match[2]
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).trim());

  return { body, question, options: optionLines.length > 0 ? optionLines : undefined };
}

// Detect booking summary in assistant message and extract fields
function extractBookingSummary(content: string): Record<string, string> | null {
  const fields: Record<string, string> = {};
  const patterns: [string, RegExp][] = [
    ['session_type', /\*\*Session Type:\*\*\s*(.+)/i],
    ['offering', /\*\*Offering:\*\*\s*(.+)/i],
    ['date_time', /\*\*Date & Time:\*\*\s*(.+)/i],
    ['participant_role', /\*\*Participant Role:\*\*\s*(.+)/i],
    ['name', /\*\*Name:\*\*\s*(.+)/i],
    ['contact_preference', /\*\*Contact Preference:\*\*\s*(.+)/i],
    ['core_values', /\*\*Core Values:\*\*\s*(.+)/i],
    ['value_explored', /\*\*Value Explored:\*\*\s*(.+)/i],
    ['insight', /\*\*Insight:\*\*\s*(.+)/i],
    ['desired_outcome', /\*\*Desired Outcome:\*\*\s*(.+)/i],
  ];

  for (const [key, regex] of patterns) {
    const match = content.match(regex);
    if (match) fields[key] = match[1].trim();
  }

  // Need at least name + some offering info to count as a booking
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
  // Messages sent to the API (raw)
  const [apiMessages, setApiMessages] = useState<Msg[]>([]);
  // Messages displayed in the UI (with Q/A metadata)
  const [displayMessages, setDisplayMessages] = useState<DisplayMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const popupTriggeredRef = useRef(false);
  const bookingSavedRef = useRef(false);
  // Track the last question asked so we can pair it with the user's answer
  const lastQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    if (rolledValue && rolledContext && !hasStarted) {
      setHasStarted(true);
      setApiMessages([]);
      setDisplayMessages([]);
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

  // Save booking to Supabase and trigger email notifications
  const saveBooking = async (summary: Record<string, string>) => {
    if (bookingSavedRef.current) return;
    bookingSavedRef.current = true;

    const bookingData = {
      name: summary.name || null,
      contact_method: summary.contact_preference?.split('(')[0]?.trim() || null,
      contact_info: summary.contact_preference?.match(/\(([^)]+)\)/)?.[1] || null,
      customer_type: summary.participant_role || null,
      intention: null,
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

      // Send email notifications
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

            // Trigger product popup
            if (!popupTriggeredRef.current && assistantSoFar.includes('At Words Incarnate, everything we create')) {
              popupTriggeredRef.current = true;
              onTriggerProductPopup?.();
            }

            // Track the latest question for Q/A pairing
            const latestParsed = parseAssistantMessage(assistantSoFar);
            if (latestParsed.question) {
              lastQuestionRef.current = latestParsed.question;
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // After stream completes, check for booking summary
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

    // Build display message with Q/A format
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
        <div className="chat-header-badge">
          <span className="text-[0.55rem] font-mono tracking-[0.15em] uppercase text-muted-foreground">Exploring</span>
          <span className="font-serif text-sm text-foreground font-medium">{rolledValue}</span>
          <span className="text-muted-foreground text-xs">×</span>
          <span className="font-serif text-sm ink-red italic">{rolledContext}</span>
        </div>
      </div>

      {/* Messages — scrollable area */}
      <div ref={scrollRef} className="chat-messages">
        {displayMessages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === displayMessages.length - 1;
          const parsed = msg.role === 'assistant' ? parseAssistantMessage(msg.content) : null;
          const showOptions = isLastAssistant && !isLoading && parsed?.options;
          const isRolledBadge = msg.content.startsWith('Rolled:');

          if (isRolledBadge) return null; // Rolled badge is in the header

          return (
            <div key={i} className="chat-msg-group">
              {/* User message with Q/A format */}
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

              {/* Assistant message */}
              {msg.role === 'assistant' && (
                <div className="chat-msg-assistant-wrap">
                  <div className="chat-msg-assistant">
                    <div className="prose-sketch max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>
                        {parsed ? parsed.body : msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Question + Options */}
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
