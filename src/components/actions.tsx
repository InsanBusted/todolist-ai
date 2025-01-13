'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  // Menggunakan OpenAI untuk melanjutkan percakapan
  const { text } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a helpful assistant!',
    messages: history,
  });

  // Mengembalikan percakapan yang telah diperbarui
  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content: text,
      },
    ],
  };
}
