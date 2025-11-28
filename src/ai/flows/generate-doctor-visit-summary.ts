'use server';

/**
 * @fileOverview Generates a structured summary of recent care logs for doctor visits.
 *
 * - generateDoctorVisitSummary - A function that generates the summary.
 * - GenerateDoctorVisitSummaryInput - The input type for the generateDoctorVisitSummary function.
 * - GenerateDoctorVisitSummaryOutput - The return type for the generateDoctorVisitSummary function.
 */

import {z} from 'zod';

const GenerateDoctorVisitSummaryInputSchema = z.object({
  logs: z.array(
    z.object({
      date: z.string(),
      text: z.string(),
      confusion: z.boolean().optional(),
      memoryIssues: z.boolean().optional(),
      moodChanges: z.boolean().optional(),
      sleepIssues: z.boolean().optional(),
      eatingIssues: z.boolean().optional(),
      safetyIncidents: z.boolean().optional(),
      caregiverMood: z.number().optional(),
    })
  ).describe('An array of daily care logs.'),
});
export type GenerateDoctorVisitSummaryInput = z.infer<typeof GenerateDoctorVisitSummaryInputSchema>;

const GenerateDoctorVisitSummaryOutputSchema = z.object({
  keyChanges: z.string().describe('Key changes since the last visit.'),
  exampleEpisodes: z.string().describe('Example episodes from the logs.'),
  caregiverConcerns: z.string().describe('Caregiver concerns based on the logs.'),
  questionsToAsk: z.string().describe('Suggested questions to ask the doctor.'),
});
export type GenerateDoctorVisitSummaryOutput = z.infer<typeof GenerateDoctorVisitSummaryOutputSchema>;

export async function generateDoctorVisitSummary(input: GenerateDoctorVisitSummaryInput): Promise<GenerateDoctorVisitSummaryOutput> {
  const validatedInput = GenerateDoctorVisitSummaryInputSchema.parse(input);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required to generate summaries.');
  }

  const prompt = buildPrompt(validatedInput.logs);
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
      encodeURIComponent(apiKey),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{text: prompt}],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = parseJsonResponse(rawText);

  return GenerateDoctorVisitSummaryOutputSchema.parse({
    keyChanges: parsed.keyChanges ?? 'No key changes were provided.',
    exampleEpisodes: parsed.exampleEpisodes ?? 'No example episodes were provided.',
    caregiverConcerns: parsed.caregiverConcerns ?? 'No caregiver concerns were provided.',
    questionsToAsk: parsed.questionsToAsk ?? 'No questions were provided.',
  });
}

function buildPrompt(logs: GenerateDoctorVisitSummaryInput['logs']): string {
  const formattedLogs = logs
    .map(log => {
      return `Date: ${log.date}\nText: ${log.text}\nConfusion: ${log.confusion ? 'Yes' : 'No'}\nMemory Issues: ${log.memoryIssues ? 'Yes' : 'No'}\nMood Changes: ${log.moodChanges ? 'Yes' : 'No'}\nSleep Issues: ${log.sleepIssues ? 'Yes' : 'No'}\nEating Issues: ${log.eatingIssues ? 'Yes' : 'No'}\nSafety Incidents: ${log.safetyIncidents ? 'Yes' : 'No'}\nCaregiver Mood: ${log.caregiverMood ?? 'Not logged'}`;
    })
    .join('\n\n');

  return `You are assisting a dementia caregiver by generating a structured summary of recent care logs for a doctor's visit. DO NOT give medical advice.

Summarize the observations from the following logs and return ONLY valid JSON matching this TypeScript type:
{
  "keyChanges": string;
  "exampleEpisodes": string;
  "caregiverConcerns": string;
  "questionsToAsk": string;
}

Logs:
${formattedLogs}`;
}

function parseJsonResponse(raw: string): Partial<GenerateDoctorVisitSummaryOutput> {
  const clean = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (error) {
    console.warn('Failed to parse Gemini response as JSON', {error, raw});
    return {};
  }
}
