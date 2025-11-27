'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Smile, Frown, Meh, Annoyed, Laugh } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CareLog, CareTag, TAG_OPTIONS } from '@/lib/types';
import { useState } from 'react';
import { Slider } from './ui/slider';

const logSchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
  text: z.string().min(1, 'Please describe what happened.'),
  caregiverMood: z.number().min(1).max(5),
  tags: z.array(z.string()),
});

type LogFormValues = z.infer<typeof logSchema>;

interface LogEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLog: (log: Omit<CareLog, 'id'>) => void;
}

const moodOptions = [
  { value: 1, icon: Annoyed, color: 'text-red-500' },
  { value: 2, icon: Frown, color: 'text-orange-500' },
  { value: 3, icon: Meh, color: 'text-yellow-500' },
  { value: 4, icon: Smile, color: 'text-green-500' },
  { value: 5, icon: Laugh, color: 'text-blue-500' },
];

export default function LogEntryForm({ isOpen, onOpenChange, onAddLog }: LogEntryFormProps) {
  const [selectedTags, setSelectedTags] = useState<Set<CareTag>>(new Set());

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      date: new Date(),
      text: '',
      caregiverMood: 3,
      tags: [],
    },
  });
  
  const toggleTag = (tag: CareTag) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      form.setValue('tags', Array.from(newTags));
      return newTags;
    });
  };

  function onSubmit(values: LogFormValues) {
    onAddLog({
      ...values,
      date: values.date.toISOString(),
      tags: Array.from(selectedTags),
    });
    form.reset();
    setSelectedTags(new Set());
    onOpenChange(false);
  }

  const moodValue = form.watch('caregiverMood');
  const CurrentMoodIcon = moodOptions.find(m => m.value === moodValue)?.icon || Meh;
  const currentMoodColor = moodOptions.find(m => m.value === moodValue)?.color || 'text-yellow-500';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Care Log</DialogTitle>
          <DialogDescription>Record today's observations. Be as detailed as you like.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What happened today?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe events, mood, activities, etc." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="space-y-2">
                <FormLabel>Quick Tags</FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {Object.entries(TAG_OPTIONS).map(([key, { label }]) => (
                        <Button
                            type="button"
                            key={key}
                            variant={selectedTags.has(key as CareTag) ? 'default' : 'outline'}
                            onClick={() => toggleTag(key as CareTag)}
                            className="justify-start"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
            <FormField
              control={form.control}
              name="caregiverMood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling?</FormLabel>
                  <div className="flex items-center gap-4">
                    <CurrentMoodIcon className={cn("h-8 w-8", currentMoodColor)} />
                    <FormControl>
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                        />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Log</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
