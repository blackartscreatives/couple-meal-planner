import React from 'react';

// Parses simple inline markdown like **bold** and *italic*.
const parseInline = (text: string): React.ReactNode => {
    // Split by markdown delimiters, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g);
    return parts.filter(Boolean).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');
  // FIX: Explicitly use React.JSX.Element to avoid issues with global JSX namespace resolution.
  const elements: React.JSX.Element[] = [];
  let listItems: { type: 'ul' | 'ol'; content: React.ReactNode }[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const listType = listItems[0].type;
      const listElement =
        listType === 'ul' ? (
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-4">
            {listItems.map((item, i) => <li key={i}>{item.content}</li>)}
          </ul>
        ) : (
          <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 pl-4">
            {listItems.map((item, i) => <li key={i}>{item.content}</li>)}
          </ol>
        );
      elements.push(listElement);
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2">{parseInline(line.substring(4))}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2">{parseInline(line.substring(3))}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={i} className="text-2xl font-extrabold mt-4 mb-2">{parseInline(line.substring(2))}</h1>);
      return;
    }

    // Unordered List
    const ulMatch = line.match(/^\s*[-*] (.*)/);
    if (ulMatch) {
      if (listItems.length > 0 && listItems[0].type !== 'ul') flushList();
      listItems.push({ type: 'ul', content: parseInline(ulMatch[1]) });
      return;
    }

    // Ordered List
    const olMatch = line.match(/^\s*\d+\. (.*)/);
    if (olMatch) {
      if (listItems.length > 0 && listItems[0].type !== 'ol') flushList();
      listItems.push({ type: 'ol', content: parseInline(olMatch[1]) });
      return;
    }

    flushList();

    if (line.trim() !== '') {
      elements.push(<p key={i} className="my-1">{parseInline(line)}</p>);
    }
  });

  flushList(); // Flush any remaining list items at the end of content

  return <div className="prose prose-sm max-w-none text-left">{elements}</div>;
};
