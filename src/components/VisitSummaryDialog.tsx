'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Copy, Sparkles, FileText, Activity, Heart, HelpCircle } from 'lucide-react';
import type { GenerateDoctorVisitSummaryOutput } from '@/ai/flows/generate-doctor-visit-summary';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface VisitSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  summary: GenerateDoctorVisitSummaryOutput | null;
  isGenerating: boolean;
}

function SummarySkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <div className="mb-2 h-6 w-1/3 rounded-md bg-muted"></div>
                    <div className="space-y-2 rounded-md bg-secondary/50 p-3">
                        <div className="h-4 w-full rounded-md bg-muted"></div>
                        <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                        <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function VisitSummaryDialog({ isOpen, onOpenChange, summary, isGenerating }: VisitSummaryDialogProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (!summary) return;
    const textToCopy = `
Doctor Visit Summary
--------------------

Key Changes:
${summary.keyChanges}

Symptom Trends:
${summary.symptomTrends}

Positive Observations:
${summary.positiveObservations}

Caregiver Concerns:
${summary.caregiverConcerns}

Questions to Ask:
${summary.questionsToAsk}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    toast({
      title: 'Copied to clipboard!',
      description: 'The summary has been copied and is ready to paste.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI-Generated Visit Summary
          </DialogTitle>
          <DialogDescription>
            Here is a summary of recent logs to help guide your conversation with the doctor. This is not medical advice.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
          {isGenerating && !summary ? (
            <SummarySkeleton />
          ) : summary ? (
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-headline font-semibold text-primary">
                    <FileText className="h-5 w-5" /> Key Changes
                </h3>
                <p className="whitespace-pre-wrap rounded-md bg-secondary/50 p-4">{summary.keyChanges}</p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-headline font-semibold text-primary">
                    <Activity className="h-5 w-5" /> Symptom Trends
                </h3>
                <p className="whitespace-pre-wrap rounded-md bg-secondary/50 p-4">{summary.symptomTrends}</p>
              </div>
               <div>
                <h3 className="mb-2 flex items-center gap-2 font-headline font-semibold text-green-600">
                    <Heart className="h-5 w-5" /> Positive Observations
                </h3>
                <p className="whitespace-pre-wrap rounded-md bg-green-500/10 p-4">{summary.positiveObservations}</p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-headline font-semibold text-amber-600">
                    <Heart className="h-5 w-5" /> Caregiver Concerns
                </h3>
                <p className="whitespace-pre-wrap rounded-md bg-amber-500/10 p-4">{summary.caregiverConcerns}</p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-headline font-semibold text-accent">
                    <HelpCircle className="h-5 w-5" /> Questions to Ask
                </h3>
                <div className="whitespace-pre-wrap rounded-md bg-blue-500/10 p-4">
                  <ul className="list-disc pl-5 space-y-1">
                      {summary.questionsToAsk.split(/-\s|\*\s/).filter(q => q.trim()).map((q, i) => <li key={i}>{q.trim()}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleCopyToClipboard} disabled={!summary}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
