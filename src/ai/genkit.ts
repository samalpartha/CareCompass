'use client';
import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GENKIT_API_KEY as string,
    }),
  ],
  // Log metadata to the console.
  logConfig: {
    channel: 'stdout',
    // In a browser, you can use `json` or `simple` format.
    format: 'json',
  },
  // Force client-side execution.
  flowStateStore: 'local',
  traceStore: 'local',
});
