// src/components/OptimizerSelect.tsx
"use client";

import type * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { OptimizationMethod } from "@/types/portfolio";

const optimizationMethods: OptimizationMethod[] = [
  "Modern Portfolio Theory",
  "Black-Litterman",
  "Monte Carlo Simulation",
  "Risk Parity",
  "Equal Weighting",
];

interface OptimizerSelectProps {
  selectedMethod: OptimizationMethod;
  onMethodChange: (method: OptimizationMethod) => void;
}

export function OptimizerSelect({ selectedMethod, onMethodChange }: OptimizerSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="optimizer-select" className="text-sm font-medium">
        Optimization Method
      </Label>
      <Select
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as OptimizationMethod)}
      >
        <SelectTrigger id="optimizer-select" className="w-full">
          <SelectValue placeholder="Choose optimization method" />
        </SelectTrigger>
        <SelectContent>
          {optimizationMethods.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select the algorithm to optimize your portfolio.
      </p>
    </div>
  );
}
