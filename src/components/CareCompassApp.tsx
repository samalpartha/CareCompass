'use client';

import { useState, useEffect } from 'react';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import type { CareRecipient, CareLog } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

function AppLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2 pt-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CareCompassApp() {
  const [careRecipient, setCareRecipient] = useState<CareRecipient | null>(null);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        const recipientData = localStorage.getItem('careRecipient');
        if (recipientData) {
          setCareRecipient(JSON.parse(recipientData));
        }
        const logsData = localStorage.getItem('careLogs');
        if (logsData) {
          setLogs(JSON.parse(logsData).sort((a: CareLog, b: CareLog) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error("Failed to parse from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isMounted]);

  const handleUpdate = (recipient: CareRecipient | null, newLogs: CareLog[]) => {
    const sortedLogs = newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (recipient) {
      localStorage.setItem('careRecipient', JSON.stringify(recipient));
      setCareRecipient(recipient);
    }
    localStorage.setItem('careLogs', JSON.stringify(sortedLogs));
    setLogs(sortedLogs);
  };

  const handleReset = () => {
    localStorage.removeItem('careRecipient');
    localStorage.removeItem('careLogs');
    setCareRecipient(null);
    setLogs([]);
  };

  if (!isMounted || isLoading) {
    return <AppLoader />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {!careRecipient ? (
        <Onboarding onComplete={(r) => handleUpdate(r, [])} />
      ) : (
        <Dashboard
          careRecipient={careRecipient}
          logs={logs}
          onUpdateLogs={(newLogs) => handleUpdate(careRecipient, newLogs)}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
