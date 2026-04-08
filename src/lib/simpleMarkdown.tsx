import React from 'react';

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={key++}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++}>{match[3]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function SimpleMarkdown({ children }: { children: string }) {
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc pl-5 space-y-1">
        {listItems.map((item, i) => <li key={i}>{inlineFormat(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ');
    elements.push(<p key={key++}>{inlineFormat(text)}</p>);
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushList();
      flushParagraph();
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }

  flushList();
  flushParagraph();

  return <>{elements}</>;
}
