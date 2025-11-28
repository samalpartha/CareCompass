import { BrainCircuit, BrainCog, HeartPulse, Bed, Utensils, AlertTriangle } from "lucide-react";

export interface CareRecipient {
  name: string;
  age: number;
  condition: 'alzheimers' | 'dementia' | 'not-specified';
  stage?: 'early' | 'mid' | 'late' | 'not-specified';
}

export const TAG_OPTIONS: Record<CareTag, { label: string; icon: any; description: string }> = {
  confusion: { label: 'Confusion', icon: BrainCircuit, description: 'Episodes of disorientation or confusion.' },
  memoryIssues: { label: 'Memory', icon: BrainCog, description: 'Problems with short-term or long-term memory.' },
  moodChanges: { label: 'Mood', icon: HeartPulse, description: 'Significant shifts in mood or emotion.' },
  sleepIssues: { label: 'Sleep', icon: Bed, description: 'Disturbances in sleep patterns.' },
  eatingIssues: { label: 'Eating', icon: Utensils, description: 'Changes in appetite or eating habits.' },
  safetyIncidents: { label: 'Safety', icon: AlertTriangle, description: 'Events like falls or wandering.' },
};

export type CareTag = 'confusion' | 'memoryIssues' | 'moodChanges' | 'sleepIssues' | 'eatingIssues' | 'safetyIncidents';

export interface CareLog {
  id: string;
  date: string; // ISO string
  text: string;
  caregiverMood: number; // 1-5
  tags: CareTag[];
}
