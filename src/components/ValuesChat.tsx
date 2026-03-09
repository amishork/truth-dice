import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/values-chat`;

interface ValuesChatProps {
  rolledValue: string;
  rolledContext: string;
  onTriggerProductPopup?: () => void;
}

export const ValuesChat: React.FC<ValuesChatProps> = ({ rolledValue, rolledContext, onTriggerProductPopup }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const popupTriggeredRef = useRef(false);

  useEffect(() => {
    if (rolledValue && rolledContext && !hasStarted) {
      setHasStarted(true);
      setMessages([]);
      startConversation();
    }
  }, [rolledValue, rolledContext]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const exportConversation = () => {
    if (messages.length === 0) return;
    
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

    messages.forEach((msg) => {
      if (msg.content.startsWith("Rolled:")) return;
      const parsed = msg.role === "assistant" ? parseAssistantMessage(msg.content) : null;
      const label = msg.role === "user" ? "YOU" : "VALUES COACH";
      lines.push(`[${label}]`);
      lines.push(parsed ? parsed.body : msg.content);
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
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantSoFar }];
            });
            scrollToBottom();
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const initMsgs: Msg[] = [{ role: 'user', content: `I just rolled the value "${rolledValue}" with the context "${rolledContext}". Begin the reflection.` }];
      setMessages([{ role: 'user', content: `Rolled: ${rolledValue} × ${rolledContext}` }]);
      await streamChat(initMsgs);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try rolling again.' }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;
    const userMsg: Msg = { role: 'user', content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      await streamChat(newMessages.filter(m => m.content && !m.content.startsWith('Rolled:')));
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    }
    setIsLoading(false);
  };

  const handleOptionClick = (option: string) => {
    sendMessage(option);
  };

  if (!rolledValue || !rolledContext) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <div className="w-16 h-16 sketch-card flex items-center justify-center mb-6 animate-float">
          <div className="absolute top-0 right-0 w-6 h-6 cross-hatch opacity-20 pointer-events-none" />
          <Sparkles className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-lg font-serif text-foreground/60 italic">Roll the dice to begin</p>
        <p className="text-[0.6rem] font-mono mt-3 max-w-[240px] text-muted-foreground tracking-[0.15em] uppercase">
          Your coach will guide a Socratic exploration of your values
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-foreground/12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Values Coach</h3>
          </div>
          {messages.length > 1 && (
            <button
              onClick={exportConversation}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              title="Export conversation"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
        <p className="text-[0.6rem] text-muted-foreground mt-1 font-mono tracking-[0.12em] uppercase">
          Exploring <span className="ink-red font-medium">{rolledValue}</span> × <span className="ink-red font-medium">{rolledContext}</span>
        </p>
      </div>

      {/* Rolled badge */}
      <div className="px-5 py-3 border-b border-foreground/8">
        <div className="inline-flex items-center gap-2 sketch-card px-3 py-1.5">
          <span className="text-[0.55rem] font-mono tracking-[0.15em] uppercase text-muted-foreground">Rolled</span>
          <span className="font-serif text-sm text-foreground font-medium">{rolledValue}</span>
          <span className="text-muted-foreground text-xs">×</span>
          <span className="font-serif text-sm ink-red italic">{rolledContext}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
          const parsed = msg.role === 'assistant' ? parseAssistantMessage(msg.content) : null;
          const showOptions = isLastAssistant && !isLoading && parsed?.options;

          return (
            <div key={i}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'sketch-card pencil-shade text-foreground font-sans'
                      : 'border-l-2 border-primary/40 bg-transparent text-foreground pl-4 pr-0 py-2'
                  }`}
                >
                  <div className="prose-sketch max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>
                      {parsed ? parsed.body : msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Question + Options */}
              {showOptions && parsed?.question && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/40">
                  <p className="text-sm font-serif text-foreground mb-3">{parsed.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {parsed.options!.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => handleOptionClick(opt)}
                        className="sketch-card px-4 py-2 text-sm font-sans text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
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
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="border-l-2 border-primary/40 pl-4 py-2">
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-foreground/12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={isLoading}
            className="flex-1 bg-card border-[1.5px] border-foreground/20 rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:opacity-50 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-10 h-10 flex items-center justify-center btn-sketch-primary disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
