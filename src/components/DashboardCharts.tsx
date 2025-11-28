'use client';

import { useMemo } from 'react';
import type { CareLog, CareTag } from '@/lib/types';
import { format, eachWeekOfInterval, subWeeks, endOfWeek } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TAG_OPTIONS } from '@/lib/types';
import { Frown, Laugh, Meh, Smile, Annoyed } from 'lucide-react';

interface DashboardChartsProps {
  logs: CareLog[];
}

const chartConfigTags: ChartConfig = {
  confusion: { label: TAG_OPTIONS.confusion.label, color: 'hsl(var(--chart-1))' },
  memoryIssues: { label: TAG_OPTIONS.memoryIssues.label, color: 'hsl(var(--chart-2))' },
  moodChanges: { label: TAG_OPTIONS.moodChanges.label, color: 'hsl(var(--chart-3))' },
  sleepIssues: { label: TAG_OPTIONS.sleepIssues.label, color: 'hsl(var(--chart-4))' },
  eatingIssues: { label: TAG_OPTIONS.eatingIssues.label, color: 'hsl(var(--chart-5))' },
  safetyIncidents: { label: TAG_OPTIONS.safetyIncidents.label, color: 'hsl(var(--chart-destructive))' },
};


const chartConfigMood: ChartConfig = {
  mood_1: { label: 'Stressed', color: 'hsl(var(--chart-destructive))', icon: Annoyed },
  mood_2: { label: 'Sad', color: 'hsl(var(--chart-1))', icon: Frown },
  mood_3: { label: 'Okay', color: 'hsl(var(--chart-5))', icon: Meh },
  mood_4: { label: 'Good', color: 'hsl(var(--chart-4))', icon: Smile },
  mood_5: { label: 'Great', color: 'hsl(var(--chart-2))', icon: Laugh },
};

export default function DashboardCharts({ logs }: DashboardChartsProps) {
  const { weeklyTagData, moodFrequencyData } = useMemo(() => {
    const now = new Date();
    const fourWeeksAgo = subWeeks(now, 3);

    const weeks = eachWeekOfInterval(
      { start: fourWeeksAgo, end: now },
      { weekStartsOn: 1 } // Monday
    );

    const weeklyTagData = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const weeklyCounts = Object.keys(TAG_OPTIONS).reduce((acc, tag) => {
        acc[tag as CareTag] = weekLogs.filter(log => log.tags.includes(tag as CareTag)).length;
        return acc;
      }, {} as Record<CareTag, number>);
      
      return {
        name: format(weekStart, 'MMM d'),
        ...weeklyCounts,
      };
    });

    const recentLogs = logs.filter(log => new Date(log.date) >= subWeeks(now, 4));
    const moodCounts = [1, 2, 3, 4, 5].map(moodValue => ({
      mood: `mood_${moodValue}`,
      count: recentLogs.filter(log => log.caregiverMood === moodValue).length,
    }));

    return { weeklyTagData, moodFrequencyData: moodCounts };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Weekly Symptom Tracker</CardTitle>
          <CardDescription>Incidents recorded over the last 4 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigTags} className="h-[250px] w-full">
            <BarChart data={weeklyTagData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {Object.keys(TAG_OPTIONS).map(tag => (
                <Bar key={tag} dataKey={tag} fill={`var(--color-${tag})`} stackId="a" radius={4} />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Caregiver Mood</CardTitle>
          <CardDescription>Mood frequency in the last 4 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigMood} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={moodFrequencyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="mood"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => chartConfigMood[value as keyof typeof chartConfigMood]?.label}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" radius={5} layout="vertical">
                    {moodFrequencyData.map((entry, index) => (
                       <div key={`cell-${index}`} style={{ backgroundColor: `var(--color-${entry.mood})` }}/>
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
