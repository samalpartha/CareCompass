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
  recipientName: z.string().describe("The name of the care recipient."),
});
export type GenerateDoctorVisitSummaryInput = z.infer<
  typeof GenerateDoctorVisitSummaryInputSchema
>;

export const GenerateDoctorVisitSummaryOutputSchema = z.object({
  keyChanges: z.string().describe('Key changes observed since the last visit.'),
  symptomTrends: z.string().describe('Observed trends in specific symptoms (e.g., increased confusion in evenings).'),
  positiveObservations: z.string().describe('Any positive moments or signs of stability noted in the logs.'),
  caregiverConcerns: z.string().describe('Primary concerns for the caregiver, including impact on their well-being.'),
  questionsToAsk: z.string().describe('A bulleted list of suggested questions to ask the doctor.'),
});
export type GenerateDoctorVisitSummaryOutput = z.infer<
  typeof GenerateDoctorVisitSummaryOutputSchema
>;

function buildPrompt(input: GenerateDoctorVisitSummaryInput): string {
  const logEntries = input.logs.map(log => {
    const tags = [
      log.confusion && 'Confusion',
      log.memoryIssues && 'Memory Issues',
      log.moodChanges && 'Mood Changes',
      log.sleepIssues && 'Sleep Issues',
      log.eatingIssues && 'Eating Issues',
      log.safetyIncidents && 'Safety Incidents',
    ].filter(Boolean).join(', ');

    return `
- Date: ${log.date}
  - Observation: ${log.text}
  - Tags: ${tags || 'None'}
  - Caregiver Mood (1-5 scale): ${log.caregiverMood}
`;}).join('');

  return `You are an empathetic AI assistant helping a caregiver prepare for a doctor's appointment for a loved one named ${input.recipientName}, who is living with dementia or Alzheimer's.
Your task is to create a clear, structured, and insightful summary based on the caregiver's recent logs. The tone should be objective and helpful, but also acknowledge the caregiver's perspective.
DO NOT provide medical advice. Focus on summarizing the provided data.

Analyze the following logs and generate a JSON object with the following structure:
- "keyChanges": A summary of the most significant changes (positive or negative) in ${input.recipientName}'s behavior, mood, or health.
- "symptomTrends": Identify any patterns or trends. For example, "Increased confusion noted in the evenings," or "Memory issues seem more frequent after poor sleep."
- "positiveObservations": Highlight any positive moments or periods of stability. This is important for a balanced view.
- "caregiverConcerns": Based on the caregiver's mood and the content of the logs, summarize the main concerns. Mention the emotional toll if the logs suggest it (e.g., "The logs suggest a high level of stress for the caregiver, with frequent mood ratings of 1 or 2.").
- "questionsToAsk": Generate a bulleted list of 3-5 specific questions the caregiver might want to ask the doctor based on the logs. Frame them as questions, e.g., "- What should we do about the recent increase in nighttime wandering?".

Here are the logs:
${logEntries}
`;
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
            keyChanges: { type: "STRING", description: "Key changes observed since the last visit." },
            symptomTrends: { type: "STRING", description: "Observed trends in specific symptoms (e.g., increased confusion in evenings)." },
            positiveObservations: { type: "STRING", description: "Any positive moments or signs of stability noted in the logs." },
            caregiverConcerns: { type: "STRING", description: "Primary concerns for the caregiver, including impact on their well-being." },
            questionsToAsk: { type: "STRING", description: "A bulleted list of suggested questions to ask the doctor." }
        },
        required: ["keyChanges", "symptomTrends", "positiveObservations", "caregiverConcerns", "questionsToAsk"]
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
    
    // Defensive check for response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        throw new Error("Invalid response structure from API.");
    }
    
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
