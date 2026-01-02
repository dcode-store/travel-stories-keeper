import React from 'react';

interface SimpleMarkdownProps {
  content: string;
  className?: string;
}

export function SimpleMarkdown({ content, className = '' }: SimpleMarkdownProps) {
  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic: _text_
      const italicMatch = remaining.match(/(?<![a-zA-Z])_(.+?)_(?![a-zA-Z])/);

      const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
      const italicIndex = italicMatch ? remaining.indexOf(italicMatch[0]) : -1;

      // Find the earliest match
      let earliestMatch: RegExpMatchArray | null = null;
      let earliestIndex = -1;
      let type: 'bold' | 'italic' | null = null;

      if (boldIndex !== -1 && (italicIndex === -1 || boldIndex < italicIndex)) {
        earliestMatch = boldMatch;
        earliestIndex = boldIndex;
        type = 'bold';
      } else if (italicIndex !== -1) {
        earliestMatch = italicMatch;
        earliestIndex = italicIndex;
        type = 'italic';
      }

      if (earliestMatch && earliestIndex !== -1 && type) {
        // Add text before the match
        if (earliestIndex > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, earliestIndex)}</span>);
        }

        // Add the formatted text
        if (type === 'bold') {
          parts.push(<strong key={key++} className="font-semibold">{earliestMatch[1]}</strong>);
        } else {
          parts.push(<em key={key++} className="italic">{earliestMatch[1]}</em>);
        }

        remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
      } else {
        // No more matches, add the rest
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  const parseContent = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    const result: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let blockquoteLines: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        result.push(
          <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    const flushBlockquote = () => {
      if (blockquoteLines.length > 0) {
        result.push(
          <blockquote 
            key={`quote-${result.length}`} 
            className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2"
          >
            {blockquoteLines.map((line, i) => (
              <p key={i}>{parseInline(line)}</p>
            ))}
          </blockquote>
        );
        blockquoteLines = [];
      }
    };

    lines.forEach((line, index) => {
      // List item: starts with • or -
      if (line.match(/^[•\-]\s/)) {
        flushBlockquote();
        const content = line.replace(/^[•\-]\s/, '');
        listItems.push(<li key={`li-${index}`}>{parseInline(content)}</li>);
      }
      // Blockquote: starts with >
      else if (line.startsWith('> ')) {
        flushList();
        const content = line.substring(2);
        blockquoteLines.push(content);
      }
      // Regular line
      else {
        flushList();
        flushBlockquote();
        
        if (line.trim() === '') {
          result.push(<br key={`br-${index}`} />);
        } else {
          result.push(
            <p key={`p-${index}`} className="leading-relaxed">
              {parseInline(line)}
            </p>
          );
        }
      }
    });

    // Flush any remaining lists or blockquotes
    flushList();
    flushBlockquote();

    return <>{result}</>;
  };

  return (
    <div className={`prose prose-sm max-w-none text-foreground/90 ${className}`}>
      {parseContent(content)}
    </div>
  );
}
