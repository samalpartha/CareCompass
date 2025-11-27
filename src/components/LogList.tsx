'use client';

import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import type { CareLog } from '@/lib/types';
import { Badge } from './ui/badge';
import { TAG_OPTIONS } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { FileSearch } from 'lucide-react';

interface LogListProps {
  logs: CareLog[];
}

function formatDate(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, 'p')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'p')}`;
  return format(date, 'MMM d, yyyy, p');
}

export default function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center">
        <FileSearch className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No Logs Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Click "Add New Log" to start recording observations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map(log => {
        const logDate = new Date(log.date);
        return (
          <Card key={log.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{formatDate(logDate)}</CardTitle>
              <CardDescription>{formatDistanceToNow(logDate, { addSuffix: true })}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{log.text}</p>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                {log.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{TAG_OPTIONS[tag]?.label || tag}</Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
