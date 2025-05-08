// src/components/FiltersForm.tsx
"use client";

import React, { useEffect } from "react";
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
import { FilterCriteriaSchema } from "@/types/portfolio"; // Import the schema


// Use the imported schema directly for form validation
const formSchema = FilterCriteriaSchema.extend({
  // Override the number types for display purposes (hundreds of millions / millions)
  marketCapMin: z.coerce.number().min(0).optional().nullable(),
  volumeMin: z.coerce.number().min(0).optional().nullable(),
}).omit({ interval: false }); // Keep interval as string for the form schema

// Define the allowed intervals explicitly here for the Select component
const allowedIntervals = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
    "1y",
    "2y",
    "5y",
    "10y",
] as const;

interface FiltersFormProps {
  initialFilters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
}

export function FiltersForm({ initialFilters, onFiltersChange }: FiltersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Convert numbers from FilterCriteria representation to form display representation
      marketCapMin: initialFilters.marketCapMin !== null ? initialFilters.marketCapMin / 100_000_000 : null,
      volumeMin: initialFilters.volumeMin !== null ? initialFilters.volumeMin / 1_000_000 : null,
      interval: initialFilters.interval, // String type matches now
    },
  });

  // Watch for changes and call onFiltersChange
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Ensure values are correctly typed and scaled before passing
      const marketCapInput = values.marketCapMin ?? null;
      const volumeInput = values.volumeMin ?? null;

      // Convert numbers back to the FilterCriteria representation (full numbers)
      const marketCapValue = marketCapInput !== null && marketCapInput >= 0 ? marketCapInput * 100_000_000 : null;
      const volumeValue = volumeInput !== null && volumeInput >= 0 ? volumeInput * 1_000_000 : null;

      // Construct the FilterCriteria object with the correct types
      const typedValues: FilterCriteria = {
        marketCapMin: marketCapValue,
        volumeMin: volumeValue,
        interval: values.interval as FilterCriteria['interval'], // Assert type based on allowedIntervals
      };

      // Basic validation to ensure interval is one of the allowed values
      if (allowedIntervals.includes(typedValues.interval)) {
          onFiltersChange(typedValues);
      } else {
         // Handle invalid interval string if necessary, though Select should prevent this
         console.error("Invalid interval selected:", typedValues.interval);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFiltersChange]);

  // Effect to reset the form when initialFilters prop changes
  useEffect(() => {
    form.reset({
      // Convert numbers from FilterCriteria representation to form display representation on reset
      marketCapMin: initialFilters.marketCapMin !== null ? initialFilters.marketCapMin / 100_000_000 : null,
      volumeMin: initialFilters.volumeMin !== null ? initialFilters.volumeMin / 1_000_000 : null,
      interval: initialFilters.interval, // String type matches now
    });
  }, [initialFilters, form]); // form.reset is stable, including form is good practice


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
              <FormLabel>Min. Market Cap (Hundreds of Millions $)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100 (for $10B)" {...field} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Minimum market capitalization in hundreds of millions of dollars.
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
              <FormLabel>Min. Volume (Millions)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1 (for 1M)" {...field} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} value={field.value ?? ''}/>
              </FormControl>
              <FormDescription>
                Minimum average trading volume in millions.
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
              <Select onValueChange={field.onChange} value={field.value} /* Control value for reset */ >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Map over the allowed intervals */}
                  {allowedIntervals.map(intervalValue => (
                     <SelectItem key={intervalValue} value={intervalValue}>
                       {/* Capitalize first letter for display */}
                       {intervalValue.charAt(0).toUpperCase() + intervalValue.slice(1)}
                     </SelectItem>
                   ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The frequency or period of historical data points.
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
