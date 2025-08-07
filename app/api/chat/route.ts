import { togetherai } from '@ai-sdk/togetherai';
import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

// Allow responses up to 100 seconds
export const maxDuration = 100;

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: togetherai('openai/gpt-oss-120b'),
    system: 'You are a helpful assitant. Always use the webSearch tool. Always provide source links in your response (the sources which you got from the webSearch tool). You are a helpful assistant that searches the web for information and provides accurate answer. Use simple english. Use the webSearch tool in every message! Do not create tables. You are a helpful assistant that searches the web for information and provides accurate answer.',
    messages: convertToModelMessages(messages),
    tools: {
      webSearch: tool({
        description: 'Search the web for current information on a topic. Use this tool in every message, always. Always provide source links in your response.',
        inputSchema: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
          try {
            const results = await exa.searchAndContents(query, {
              numResults: 8,
              type: 'auto',
              text: {
                maxCharacters: 2000
              },
              livecrawl: "fallback",
            });
            console.log('Exa search results:', results.results);
            return results.results;
          } catch (error) {
            console.error('Exa search error:', error);
            return { error: 'Failed to perform web search' };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}