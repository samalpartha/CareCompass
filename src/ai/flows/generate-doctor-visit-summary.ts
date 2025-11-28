'use server';
/**
 * @fileOverview Generates a structured summary of recent care logs for doctor visits.
 *
 * - generateDoctorVisitSummary - A function that generates the summary.
 * - GenerateDoctorVisitSummaryInput - The input type for the generateDoctorVisitSummary function.
 * - GenerateDoctorVisitSummaryOutput - The return type for the generateDoctorVisitSummary function.
 */

import { ai } from '@/ai/genkit';
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

const GenerateDoctorVisitSummaryInputSchema = z.object({
  logs: z.array(LogSchema).describe('An array of daily care logs.'),
});
export type GenerateDoctorVisitSummaryInput = z.infer<
  typeof GenerateDoctorVisitSummaryInputSchema
>;

const GenerateDoctorVisitSummaryOutputSchema = z.object({
  keyChanges: z.string().describe('Key changes since the last visit.'),
  exampleEpisodes: z.string().describe('Example episodes from the logs.'),
  caregiverConcerns: z.string().describe('Caregiver concerns based on the logs.'),
  questionsToAsk: z.string().describe('Suggested questions to ask the doctor.'),
});
export type GenerateDoctorVisitSummaryOutput = z.infer<
  typeof GenerateDoctorVisitSummaryOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'doctorVisitSummaryPrompt',
  input: { schema: GenerateDoctorVisitSummaryInputSchema },
  output: { schema: GenerateDoctorVisitSummaryOutputSchema },
  prompt: `You are assisting a dementia caregiver by generating a structured summary of recent care logs for a doctor's visit. DO NOT give medical advice.

Summarize the observations from the following logs.
{{#each logs}}
Date: {{this.date}}
Text: {{this.text}}
Confusion: {{#if this.confusion}}Yes{{else}}No{{/if}}
Memory Issues: {{#if this.memoryIssues}}Yes{{else}}No{{/if}}
Mood Changes: {{#if this.moodChanges}}Yes{{else}}No{{/if}}
Sleep Issues: {{#if this.sleepIssues}}Yes{{else}}No{{/if}}
Eating Issues: {{#if this.eatingIssues}}Yes{{else}}No{{/if}}
Safety Incidents: {{#if this.safetyIncidents}}Yes{{else}}No{{/if}}
Caregiver Mood: {{this.caregiverMood}}
{{/each}}`,
});

const summaryFlow = ai.defineFlow(
  {
    name: 'summaryFlow',
    inputSchema: GenerateDoctorVisitSummaryInputSchema,
    outputSchema: GenerateDoctorVisitSummaryOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.output!;
  }
);

export async function generateDoctorVisitSummary(
  input: GenerateDoctorVisitSummaryInput
): Promise<GenerateDoctorVisitSummaryOutput> {
  return await summaryFlow(input);
}
