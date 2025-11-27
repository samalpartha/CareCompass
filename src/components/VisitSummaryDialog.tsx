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
import { Copy, Download } from 'lucide-react';
import type { GenerateDoctorVisitSummaryOutput } from '@/ai/flows/generate-doctor-visit-summary';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface VisitSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  summary: GenerateDoctorVisitSummaryOutput | null;
}

export default function VisitSummaryDialog({ isOpen, onOpenChange, summary }: VisitSummaryDialogProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (!summary) return;
    const textToCopy = `
Doctor Visit Summary
--------------------

Key Changes Since Last Visit:
${summary.keyChanges}

Example Episodes:
${summary.exampleEpisodes}

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
          <DialogTitle>AI-Generated Visit Summary</DialogTitle>
          <DialogDescription>
            Here is a summary of recent logs to help guide your conversation with the doctor. This is not medical advice.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-6">
          {summary ? (
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="mb-2 font-headline font-semibold text-primary">Key Changes Since Last Visit</h3>
                <p className="whitespace-pre-wrap rounded-md bg-secondary/50 p-3">{summary.keyChanges}</p>
              </div>
              <div>
                <h3 className="mb-2 font-headline font-semibold text-primary">Example Episodes</h3>
                <p className="whitespace-pre-wrap rounded-md bg-secondary/50 p-3">{summary.exampleEpisodes}</p>
              </div>
              <div>
                <h3 className="mb-2 font-headline font-semibold text-primary">Caregiver Concerns</h3>
                <p className="whitespace-pre-wrap rounded-md bg-secondary/50 p-3">{summary.caregiverConcerns}</p>
              </div>
              <div>
                <h3 className="mb-2 font-headline font-semibold text-accent">Questions You May Want to Ask</h3>
                <p className="whitespace-pre-wrap rounded-md bg-accent/10 p-3">{summary.questionsToAsk}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p>Generating summary...</p>
            </div>
          )}
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
