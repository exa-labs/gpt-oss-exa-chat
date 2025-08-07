'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import MessageContent from './components/messages';
import { getAssetPath } from './utils';
import { DefaultChatTransport } from 'ai';

// Interface for search results
interface SearchResult {
  title: string;
  url: string;
  text: string;
  author?: string;
  publishedDate?: string;
  favicon?: string;
}



// Search Results Component
function SearchResultsSection({ results, isExpanded, setIsExpanded }: { 
  results: SearchResult[]; 
  isExpanded: boolean; 
  setIsExpanded: (expanded: boolean) => void; 
}) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg 
            className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${isExpanded ? 'rotate-0' : '-rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <h3 className="text-md font-medium">Search Results</h3>
        </button>
      </div>

      {isExpanded && (
        <div className="pl-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div key={idx} className="text-sm group relative">
                <a href={result.url} 
                   target="_blank" 
                   className="text-gray-600 hover:text-[var(--brand-default)] flex items-center gap-2">
                  [{idx + 1}] {result.title}
                  {result.favicon && (
                    <img 
                      src={result.favicon} 
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                </a>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-6 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                  {result.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [loadingDots, setLoadingDots] = useState('');
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: getAssetPath('/api/chat'),
    }),
  });
  
  // Track if we have messages OR if we're currently searching (to move input down immediately)
  const hasMessages = messages.length > 0 || isSearching;
  const isStreaming = status === 'streaming';

  // Loading dots animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots('.'.repeat(count));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  // Watch for LLM completion
  useEffect(() => {
    if (!isStreaming && isLLMLoading) {
      setIsLLMLoading(false);
    }
  }, [isStreaming, isLLMLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSearching || isLLMLoading) return;
    
    const userQuery = input;
    setInput('');
    
    // Reset states
    setIsSearching(true);
    setIsLLMLoading(false);
    setSearchResults([]);
    setSearchError(null);

    try {
      // First, get web search results
      const searchResponse = await fetch(getAssetPath('/api/exawebsearch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userQuery,
          previousQueries: previousQueries.slice(-3)
        }),
      });

      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }

      const { results } = await searchResponse.json();
      setSearchResults(results);
      setIsSearching(false);
      setIsLLMLoading(true);

      // Format search context
      const searchContext = results.length > 0
        ? `Web Search Results:\n\n${results.map((r: SearchResult, i: number) => 
            `Source [${i + 1}]:\nTitle: ${r.title}\nURL: ${r.url}\n${r.author ? `Author: ${r.author}\n` : ''}${r.publishedDate ? `Date: ${r.publishedDate}\n` : ''}Content: ${r.text}\n---`
          ).join('\n\n')}\n\nInstructions: Based on the above search results, please provide an answer to the user's query. When referencing information, cite the source number in brackets like [1], [2], etc. Use simple english words. Do not create tables. You are a helpful and friendly assistant.`
        : '';

      // Send message with search context
      sendMessage({
        role: 'user',
        parts: [{ 
          type: 'text', 
          text: searchContext ? `${searchContext}\n\nUser Query: ${userQuery}` : userQuery 
        }]
      });

      // Update previous queries after successful search
      setPreviousQueries(prev => [...prev, userQuery].slice(-3));

    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error:', err);
      setIsLLMLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="md:max-w-4xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <a
            href="https://dashboard.exa.ai/"
            target="_blank"
            className="flex items-center px-4 py-1.5 bg-[var(--brand-default)] text-white 
            rounded-full hover:bg-[var(--brand-muted)] transition-all duration-200 
            font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-sm">Try Exa API</span>
          </a>
          <div className="flex items-center gap-4 text-md text-gray-600">
            <a
              href="https://exa.ai/demos"
              target="_blank"
              className="hover:text-[var(--brand-default)] transition-colors"
            >
              <span className="underline">See More Demos</span>
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="https://github.com/exa-labs/gpt-oss-exa-chat"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-[var(--brand-default)] transition-colors"
            >
              <span className="underline">View Project Code</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="md:max-w-4xl mx-auto px-4 md:px-6 py-6 pt-20 pb-24 space-y-6">
        <div className="space-y-6">
          {messages.map((message, messageIndex) => {
            
            return (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg py-3 px-4 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-gray-100 text-gray-900 text-base'
                      : 'text-gray-900 text-base'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-[15px]">
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          // Extract just the user query from the text (remove search context)
                          const userQueryMatch = part.text.match(/User Query: (.+)$/);
                          const displayText = userQueryMatch ? userQueryMatch[1] : part.text;
                          return <span key={index}>{displayText}</span>;
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div>
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          return (
                            <div key={index} className="text-[15px] leading-normal">
                              <MessageContent content={part.text} />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show search results after user message */}
              {message.role === 'user' && searchResults.length > 0 && (
                <div className="my-6">
                  <SearchResultsSection 
                    results={searchResults}
                    isExpanded={isSourcesExpanded}
                    setIsExpanded={setIsSourcesExpanded}
                  />
                </div>
              )}
              
              {/* Show LLM loading after search results */}
              {message.role === 'user' && isLLMLoading && (
                <div className="my-6">
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">GPT-OSS is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            );
          })}

          {/* Search Error */}
          {searchError && (
            <div className="p-4 bg-red-50 rounded border border-red-100">
              <p className="text-sm text-red-800">⚠️ {searchError}</p>
            </div>
          )}

          {/* Loading indicator for search */}
          {isSearching && (
            <div className="flex items-center gap-2 text-gray-500 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite_200ms]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite_400ms]"></div>
                             <span className="text-sm font-medium text-[var(--secondary-accent2x)]">
                 Searching using Exa{loadingDots}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Input Form - centered when no messages, fixed bottom otherwise */}
      <div className={`${
        hasMessages 
          ? 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t' 
          : 'fixed inset-0 flex items-center justify-center bg-transparent'
        } z-40 transition-all duration-300`}>
        <div className={`${
          hasMessages 
            ? 'w-full md:max-w-4xl mx-auto px-4 md:px-6 py-4' 
            : 'w-full md:max-w-2xl mx-auto px-4 md:px-6'
          }`}>
          <form onSubmit={handleSubmit} className="relative flex w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="w-full p-4 pr-[130px] bg-white border border-gray-200 rounded-full shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-default)] focus:ring-opacity-20 
              focus:border-[var(--brand-default)] text-base transition-all duration-200 
              placeholder:text-gray-400 hover:border-gray-300"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSearching || isLLMLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--brand-default)] 
              text-white rounded-full shadow-sm hover:bg-[var(--brand-muted)] disabled:opacity-50 
              disabled:cursor-not-allowed font-medium min-w-[110px] transition-all duration-200 
              hover:shadow-md active:transform active:scale-95"
            >
              {isSearching ? (
                <span className="inline-flex justify-center items-center">
                  <span>Searching</span>
                  <span className="w-[24px] text-left">{loadingDots}</span>
                </span>
              ) : (
                'Search'
              )}
            </button>
          </form>
          {!hasMessages && (
            <div className="text-center mt-6 text-gray-600 text-sm">
              <span> powered by </span>
                <a href="https://exa.ai" target="_blank" className="underline hover:text-[var(--brand-default)]">
                  Exa - The Web Search API 
                </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}