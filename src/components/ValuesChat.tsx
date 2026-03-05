import React, { useState, useRef, useEffect } from 'react';
import { Send, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/values-chat`;

interface ValuesChatProps {
  rolledValue: string;
  rolledContext: string;
}

export const ValuesChat: React.FC<ValuesChatProps> = ({ rolledValue, rolledContext }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const initMsgs: Msg[] = [{ role: 'user', content: `I just rolled the value "${rolledValue}" with the context "${rolledContext}". Help me explore this.` }];
      setMessages([{ role: 'user', content: `Rolled: ${rolledValue} × ${rolledContext}` }]);
      await streamChat(initMsgs);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try rolling again.' }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
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

  if (!rolledValue || !rolledContext) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <div className="w-16 h-16 border border-foreground/20 flex items-center justify-center mb-6 animate-float">
          <PenTool className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-base font-serif text-foreground/60 italic">Roll the dice to begin</p>
        <p className="text-[0.65rem] font-mono mt-3 max-w-[240px] text-muted-foreground tracking-wide uppercase">
          Your coach will guide a Socratic exploration of your values
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-foreground/15">
        <div className="flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-primary" />
          <h3 className="font-mono text-[0.65rem] tracking-widest uppercase text-foreground/70">Values Coach</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-serif italic">
          Exploring <span className="text-primary font-medium not-italic">{rolledValue}</span> through <span className="text-primary font-medium not-italic">{rolledContext}</span>
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'border border-foreground/30 bg-muted text-foreground font-sans'
                  : 'border-l-2 border-primary/40 bg-transparent text-foreground pl-4 pr-0 py-2'
              }`}
            >
              <div className="prose-sketch max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="border-l-2 border-primary/40 pl-4 py-2">
              <div className="flex gap-2">
                <span className="w-1 h-1 bg-foreground/30 rounded-full animate-pulse" />
                <span className="w-1 h-1 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-foreground/15">
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
            className="flex-1 border border-foreground/30 bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:opacity-50 transition-colors font-sans"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/80 rounded-none"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
