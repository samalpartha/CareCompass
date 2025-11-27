'use client';

import { useMemo } from 'react';
import type { CareLog, CareTag } from '@/lib/types';
import { startOfWeek, format, eachWeekOfInterval, subWeeks, endOfWeek } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { TAG_OPTIONS } from '@/lib/types';

interface DashboardChartsProps {
  logs: CareLog[];
}

const chartConfigTags: ChartConfig = Object.fromEntries(
  Object.entries(TAG_OPTIONS).map(([key, { label }], index) => [
    key,
    {
      label,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    },
  ])
);

const chartConfigMood: ChartConfig = {
  caregiverMood: {
    label: 'Caregiver Mood',
    color: 'hsl(var(--chart-2))',
  },
};

export default function DashboardCharts({ logs }: DashboardChartsProps) {
  const { weeklyTagData, moodTrendData } = useMemo(() => {
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

    const moodData = logs
      .map(log => ({ date: new Date(log.date), mood: log.caregiverMood }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const moodTrendData = moodData.map(data => ({
        date: format(data.date, 'MMM d'),
        caregiverMood: data.mood,
    })).slice(-30); // Last 30 logs

    return { weeklyTagData, moodTrendData };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Symptom Tracker</CardTitle>
          <CardDescription>Incidents recorded over the last 4 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigTags} className="h-[250px] w-full">
            <BarChart data={weeklyTagData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              {Object.keys(TAG_OPTIONS).map(tag => (
                <Bar key={tag} dataKey={tag} fill={`var(--color-${tag})`} radius={4} />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Caregiver Mood Trend</CardTitle>
          <CardDescription>Your mood ratings from recent logs (1-5 scale).</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigMood} className="h-[250px] w-full">
            <LineChart data={moodTrendData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis domain={[1, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="caregiverMood" stroke="var(--color-caregiverMood)" strokeWidth={2} dot={true} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
