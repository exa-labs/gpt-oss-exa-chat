import ReactMarkdown from 'react-markdown';

// Function to convert URLs in text to markdown links
function convertUrlsToMarkdown(text: string): string {
  // Regex to match URLs (including those in parentheses like [source](url))
  const urlRegex = /(\[source\])?(\()?https?:\/\/[^\s\)]+(\))?/g;
  
  return text.replace(urlRegex, (match, sourcePrefix, openParen, closeParen) => {
    // If it's already in markdown format [source](url), leave it as is
    if (sourcePrefix && openParen) {
      return match;
    }
    
    // If it's a URL in parentheses like (https://...), convert to [source](url)
    if (openParen && closeParen) {
      const url = match.slice(1, -1); // Remove parentheses
      return `[source](${url})`;
    }
    
    // For standalone URLs, convert to [source](url)
    return `[source](${match})`;
  });
}

const MessageContent = ({ content }: { content: string }) => {
  const processedContent = convertUrlsToMarkdown(content);
  
  return (
    <ReactMarkdown
      components={{
        // Custom styling for different markdown elements
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold mb-1.5 text-gray-900">{children}</h3>,
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-default)] hover:text-[var(--brand-muted)] underline"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside my-3 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside my-3 space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="text-gray-900">{children}</li>,
        code: ({ children }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">{children}</pre>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MessageContent; 