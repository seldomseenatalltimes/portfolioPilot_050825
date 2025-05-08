// src/components/FiltersForm.tsx
"use client";

import React from "react"; // Import React
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterCriteria } from "@/types/portfolio";

const formSchema = z.object({
  marketCapMin: z.coerce.number().positive().optional().nullable(),
  volumeMin: z.coerce.number().positive().optional().nullable(),
  interval: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
});

interface FiltersFormProps {
  initialFilters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
}

export function FiltersForm({ initialFilters, onFiltersChange }: FiltersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketCapMin: initialFilters.marketCapMin ?? null,
      volumeMin: initialFilters.volumeMin ?? null,
      interval: initialFilters.interval,
    },
  });

  // Watch for changes and call onFiltersChange
  React.useEffect(() => { // Use React.useEffect to match error stack
    const subscription = form.watch((values) => {
      // Ensure values are correctly typed before passing
      const typedValues = {
        marketCapMin: values.marketCapMin ?? null,
        volumeMin: values.volumeMin ?? null,
        interval: values.interval as FilterCriteria['interval'],
      };
      onFiltersChange(typedValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onFiltersChange]);


  // This form doesn't need its own submit button if changes are propagated live.
  // If a submit button were needed:
  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   onFiltersChange(values as FilterCriteria);
  // }

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="marketCapMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min. Market Cap ($)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1000000" {...field} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Minimum market capitalization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="volumeMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min. Volume</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100000" {...field} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} value={field.value ?? ''}/>
              </FormControl>
              <FormDescription>
                Minimum average trading volume.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The frequency of historical data points.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type="submit">Apply Filters</Button> */}
      </form>
    </Form>
  );
}
