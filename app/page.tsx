'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import MessageContent from './components/messages';
import { getAssetPath } from './utils';
import { DefaultChatTransport } from 'ai';

// Function to clean streaming text by removing the first "analysis" word
function cleanStreamingText(text: string) {
  // Remove the first word if it's "analysis"
  if (text.startsWith('analysis')) {
    return text.replace(/^analysis\s*/, '');
  }
  return text;
}

// Function to parse the model's output and separate thinking from final answer
function parseModelOutput(text: string) {
  // Split the text to find the final answer section
  const parts = text.split('assistantfinal');
  
  if (parts.length > 1) {
    // We have a thinking part and a final part
    const thinkingPart = parts[0].trim();
    const finalPart = parts[1].trim();
    
    // Clean up the thinking part by removing machine-specific commentary
    const cleanThinking = thinkingPart
      .replace(/assistantcommentary to=functions\.webSearch json\{[^}]*\}/g, '[Tool Call]')
      .replace(/assistantanalysis/g, '')
      .replace(/analysis/g, '')
      .replace(/\*\*/g, '') // Remove markdown asterisks
      .replace(/\n+/g, '\n') // Clean up multiple newlines
      .trim();
    
    return {
      thinking: cleanThinking,
      finalAnswer: finalPart
    };
  }
  
  // If no clear separation, treat entire text as final answer
  return {
    thinking: null,
    finalAnswer: text
  };
}

// Simple collapsible thinking component
function ThinkingSection({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-expand when streaming, auto-collapse when done
  useEffect(() => {
    if (isStreaming) {
      setIsExpanded(true);
    } else if (!isStreaming && isExpanded) {
      // Delay collapse slightly for smooth transition
      const timer = setTimeout(() => setIsExpanded(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>Thinking</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: getAssetPath('/api/chat'),
    }),
  });
  const hasMessages = messages.length > 0;
  const isLoading = status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    });
    setInput('');
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
            const isLastMessage = messageIndex === messages.length - 1;
            const isCurrentlyStreaming = isLastMessage && isLoading && message.role === 'assistant';
            
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
                          return <span key={index}>{part.text}</span>;
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div>
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          const parsed = parseModelOutput(part.text);
                          
                          return (
                            <div key={index}>
                              {/* Show thinking section - expanded during streaming */}
                              {(parsed.thinking || isCurrentlyStreaming) && (
                                <ThinkingSection 
                                  content={parsed.thinking || cleanStreamingText(part.text)} 
                                  isStreaming={isCurrentlyStreaming}
                                />
                              )}
                              
                              {/* Show final answer only if we have one */}
                              {parsed.finalAnswer && !isCurrentlyStreaming && (
                                <div className="text-[15px] leading-normal">
                                  <MessageContent content={parsed.finalAnswer} />
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite_200ms]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--secondary-accent2x)] animate-[bounce_1s_infinite_400ms]"></div>
              <span className="text-sm font-medium text-[var(--secondary-accent2x)]">Asking GPT-OSS-120B and searching on Exa...</span>
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
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--brand-default)] 
              text-white rounded-full shadow-sm hover:bg-[var(--brand-muted)] disabled:opacity-50 
              disabled:cursor-not-allowed font-medium min-w-[110px] transition-all duration-200 
              hover:shadow-md active:transform active:scale-95"
            >
              Search
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