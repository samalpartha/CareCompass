/**
 * @fileOverview Generates a structured summary of recent care logs for doctor visits using a direct API call.
 */

import { z } from 'zod';

const LogSchema = z.object({
  date: z.string(),
  text: z.string(),
  confusion: z.boolean().optional(),
  memoryIssues: z.boolean().optional(),
  moodChanges: z.boolean().optional(),
  sleepIssues: z.boolean().optional(),
  eatingIssues: z.boolean().optional(),
  safetyIncidents: z.boolean().optional(),
  caregiverMood: z.number().optional(),
});

export const GenerateDoctorVisitSummaryInputSchema = z.object({
  logs: z.array(LogSchema).describe('An array of daily care logs.'),
});
export type GenerateDoctorVisitSummaryInput = z.infer<
  typeof GenerateDoctorVisitSummaryInputSchema
>;

export const GenerateDoctorVisitSummaryOutputSchema = z.object({
  keyChanges: z.string().describe('Key changes since the last visit.'),
  exampleEpisodes: z.string().describe('Example episodes from the logs.'),
  caregiverConcerns: z.string().describe('Caregiver concerns based on the logs.'),
  questionsToAsk: z.string().describe('Suggested questions to ask the doctor.'),
});
export type GenerateDoctorVisitSummaryOutput = z.infer<
  typeof GenerateDoctorVisitSummaryOutputSchema
>;

function buildPrompt(input: GenerateDoctorVisitSummaryInput): string {
  const logEntries = input.logs.map(log => `
Date: ${log.date}
Text: ${log.text}
Confusion: ${log.confusion ? 'Yes' : 'No'}
Memory Issues: ${log.memoryIssues ? 'Yes' : 'No'}
Mood Changes: ${log.moodChanges ? 'Yes' : 'No'}
Sleep Issues: ${log.sleepIssues ? 'Yes' : 'No'}
Eating Issues: ${log.eatingIssues ? 'Yes' : 'No'}
Safety Incidents: ${log.safetyIncidents ? 'Yes' : 'No'}
Caregiver Mood: ${log.caregiverMood}
`).join('');

  return `You are assisting a dementia caregiver by generating a structured summary of recent care logs for a doctor's visit. DO NOT give medical advice.

Summarize the observations from the following logs.
${logEntries}`;
}


export async function generateDoctorVisitSummary(
  input: GenerateDoctorVisitSummaryInput,
  apiKey: string
): Promise<GenerateDoctorVisitSummaryOutput> {
  
  const promptText = buildPrompt(input);
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: {
        type: "OBJECT",
        properties: {
            keyChanges: { type: "STRING", description: "Key changes since the last visit." },
            exampleEpisodes: { type: "STRING", description: "Example episodes from the logs." },
            caregiverConcerns: { type: "STRING", description: "Caregiver concerns based on the logs." },
            questionsToAsk: { type: "STRING", description: "Suggested questions to ask the doctor." }
        },
        required: ["keyChanges", "exampleEpisodes", "caregiverConcerns", "questionsToAsk"]
      }
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    const jsonText = data.candidates[0].content.parts[0].text;
    const parsedOutput = JSON.parse(jsonText);

    // Validate the output against the Zod schema
    const validationResult = GenerateDoctorVisitSummaryOutputSchema.safeParse(parsedOutput);

    if (!validationResult.success) {
        throw new Error(`API response validation failed: ${validationResult.error.message}`);
    }

    return validationResult.data;

  } catch (error) {
    console.error("Error generating doctor visit summary:", error);
    throw new Error("Failed to generate summary. Please check your API key and network connection.");
  }
}
