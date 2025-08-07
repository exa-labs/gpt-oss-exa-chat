import { togetherai } from '@ai-sdk/togetherai';
import { streamText, tool, convertToModelMessages } from 'ai';

// Allow responses up to 100 seconds
export const maxDuration = 100;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: togetherai('openai/gpt-oss-120b'),
    system: 'You are a helpful assistant that provides accurate answer based on the user query and provided search results. Use simple english words. Do not create tables. You are a helpful and friendly assistant.',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}