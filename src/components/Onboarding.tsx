'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Home } from 'lucide-react';
import type { CareRecipient } from '@/lib/types';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Please enter a name or nickname.'),
  age: z.coerce.number().min(1, 'Please enter a valid age.').max(120, 'Please enter a valid age.'),
  condition: z.enum(['alzheimers', 'dementia', 'not-specified']),
  stage: z.enum(['early', 'mid', 'late', 'not-specified']).optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingProps {
  onComplete: (recipient: CareRecipient) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      age: undefined,
      condition: 'not-specified',
      stage: 'not-specified',
    },
  });

  function onSubmit(values: OnboardingFormValues) {
    onComplete(values);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tight">CareCompass</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            A simple AI companion for families caring for dementia and Alzheimer’s patients.
          </p>
          <div className="space-y-4 rounded-lg border border-dashed border-accent/50 bg-accent/10 p-4">
            <p className="text-sm text-foreground">
              CareCompass helps you log daily observations, see patterns, and generate summaries for doctor visits. It's a private, secure space to organize your thoughts and feel more prepared.
            </p>
            <p className="text-xs text-muted-foreground">
              All data is stored securely in your browser. Nothing is saved on our servers.
            </p>
          </div>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Tell us who you're caring for. This helps personalize your experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Who are you caring for?</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a name or nickname, e.g., Dad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 75" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not-specified">Not Specified</SelectItem>
                              <SelectItem value="alzheimers">Alzheimer's</SelectItem>
                              <SelectItem value="dementia">Dementia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage of condition (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not-specified">I'd rather not say</SelectItem>
                          <SelectItem value="early">Early Stage</SelectItem>
                          <SelectItem value="mid">Mid Stage</SelectItem>
                          <SelectItem value="late">Late Stage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Create Care Dashboard
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
