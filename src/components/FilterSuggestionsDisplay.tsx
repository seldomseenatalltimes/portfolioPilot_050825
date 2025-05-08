// src/components/FilterSuggestionsDisplay.tsx
"use client";

import * as React from 'react';
import type { SuggestedFilter, FilterCriteria } from "@/types/portfolio"; // Updated import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from 'lucide-react';

interface FilterSuggestionsDisplayProps {
  suggestions: SuggestedFilter[];
  onApply: (filters: FilterCriteria) => void;
  onClose: () => void;
}

// Helper to format numbers (e.g., billions, millions)
function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num}`;
}
function formatVolume(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export function FilterSuggestionsDisplay({ suggestions, onApply, onClose }: FilterSuggestionsDisplayProps) {
  return (
    <Card className="mt-4 border-accent shadow-md bg-secondary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg text-accent">AI Filter Suggestions</CardTitle>
          <CardDescription>Based on common investment strategies.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
           <X className="h-4 w-4" />
           <span className="sr-only">Close suggestions</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[200px] pr-3">
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <React.Fragment key={suggestion.strategy}>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">{suggestion.strategy}</h4>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span>Mkt Cap: <span className="font-medium">{formatNumber(suggestion.filters.marketCapMin)}</span></span>
                    <span>Volume: <span className="font-medium">{formatVolume(suggestion.filters.volumeMin)}</span></span>
                    <span>Interval: <span className="font-medium capitalize">{suggestion.filters.interval}</span></span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => onApply(suggestion.filters)}
                  >
                    Apply Filters
                  </Button>
                </div>
                {index < suggestions.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
