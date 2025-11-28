'use client';

import { useState } from 'react';
import type { CareLog, CareRecipient } from '@/lib/types';
import Header from './Header';
import { Button } from './ui/button';
import { FileText, PlusCircle, BarChart2 } from 'lucide-react';
import LogEntryForm from './LogEntryForm';
import LogList from './LogList';
import DashboardCharts from './DashboardCharts';
import { generateDoctorVisitSummary } from '@/ai/flows/generate-doctor-visit-summary';
import type { GenerateDoctorVisitSummaryOutput } from '@/ai/flows/generate-doctor-visit-summary';
import VisitSummaryDialog from './VisitSummaryDialog';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';
import { Skeleton } from './ui/skeleton';

interface DashboardProps {
  careRecipient: CareRecipient;
  logs: CareLog[];
  onUpdateLogs: (logs: CareLog[]) => void;
  onReset: () => void;
}

export default function Dashboard({ careRecipient, logs, onUpdateLogs, onReset }: DashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<GenerateDoctorVisitSummaryOutput | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { toast } = useToast();
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const handleAddLog = (newLog: Omit<CareLog, 'id'>) => {
    const updatedLogs = [{ ...newLog, id: new Date().toISOString() }, ...logs];
    onUpdateLogs(updatedLogs);
  };
  
  const handleGenerateSummary = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please set your NEXT_PUBLIC_GEMINI_API_KEY in a .env file to generate summaries.",
      });
      return;
    }

    setIsGenerating(true);
    setSummary(null); // Reset previous summary

    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentLogs = logs.filter(log => new Date(log.date) >= thirtyDaysAgo);

    if (recentLogs.length < 3) {
      toast({
        variant: "destructive",
        title: "Not Enough Data",
        description: "Please add at least 3 logs from the last 30 days to generate a meaningful summary.",
      });
      setIsGenerating(false);
      return;
    }

    const formattedLogs = recentLogs.map(log => ({
      date: new Date(log.date).toLocaleDateString(),
      text: log.text,
      confusion: log.tags.includes('confusion'),
      memoryIssues: log.tags.includes('memoryIssues'),
      moodChanges: log.tags.includes('moodChanges'),
      sleepIssues: log.tags.includes('sleepIssues'),
      eatingIssues: log.tags.includes('eatingIssues'),
      safetyIncidents: log.tags.includes('safetyIncidents'),
      caregiverMood: log.caregiverMood,
    }));

    try {
      setIsSummaryOpen(true); // Open dialog to show loading state
      const result = await generateDoctorVisitSummary({ logs: formattedLogs, recipientName: careRecipient.name }, apiKey);
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate summary', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `There was an error generating the visit summary: ${errorMessage}`,
      });
      setIsSummaryOpen(false); // Close dialog on error
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <Header careRecipientName={careRecipient.name} onReset={onReset} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <BarChart2 className="h-7 w-7 text-primary" />
               <h2 className="font-headline text-3xl font-bold">Dashboard</h2>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button onClick={() => setIsFormOpen(true)} size="lg" className="shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Log
              </Button>
              <Button onClick={handleGenerateSummary} variant="outline" size="lg" disabled={isGenerating}>
                {isGenerating ? (
                   <><div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>Generating...</>
                ) : (
                   <><FileText className="mr-2 h-5 w-5" />Generate Visit Summary</>
                )}
              </Button>
            </div>
          </div>
          
          <DashboardCharts logs={logs} />

          <div className="mt-8">
             <LogList logs={logs} />
          </div>
        </div>
      </main>
      <LogEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onAddLog={handleAddLog}
      />
      <VisitSummaryDialog
        isOpen={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        summary={summary}
        isGenerating={isGenerating}
      />
    </div>
  );
}
