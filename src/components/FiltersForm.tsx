// src/components/FiltersForm.tsx
"use client";

import React, { useEffect } from "react"; // Ensure React is imported
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
  marketCapMin: z.coerce.number().positive().optional().nullable(), // Keep internal representation as number (billions part)
  volumeMin: z.coerce.number().positive().optional().nullable(),
  interval: z.enum([
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
    "1y",
    "2y",
    "5y",
    "10y",
  ]),
});

interface FiltersFormProps {
  initialFilters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
}

export function FiltersForm({ initialFilters, onFiltersChange }: FiltersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketCapMin: initialFilters.marketCapMin ? initialFilters.marketCapMin / 1_000_000_000 : null, // Divide for initial display
      volumeMin: initialFilters.volumeMin ?? null,
      interval: initialFilters.interval,
    },
  });

  // Watch for changes and call onFiltersChange
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Ensure values are correctly typed before passing
      const marketCapValue = values.marketCapMin ? values.marketCapMin * 1_000_000_000 : null; // Multiply by 1B before passing
      const typedValues: FilterCriteria = {
        marketCapMin: marketCapValue,
        volumeMin: values.volumeMin ?? null,
        interval: values.interval as FilterCriteria['interval'],
      };
      onFiltersChange(typedValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onFiltersChange]);

  // Effect to reset the form when initialFilters prop changes
  useEffect(() => {
    form.reset({
       marketCapMin: initialFilters.marketCapMin ? initialFilters.marketCapMin / 1_000_000_000 : null, // Divide for reset display
      volumeMin: initialFilters.volumeMin ?? null,
      interval: initialFilters.interval,
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
              <FormLabel>Min. Market Cap (Billions $)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Minimum market capitalization in billions of dollars.
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
              <Select onValueChange={field.onChange} value={field.value} /* Control value for reset */ >
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
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                  <SelectItem value="10y">10 Years</SelectItem>
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
