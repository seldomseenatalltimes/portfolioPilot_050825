// src/components/ResultsTable.tsx
"use client";

import type * as React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { OptimizationResult } from "@/types/portfolio";
import { TrendingUp, BarChart3, Percent, AlertTriangle, Activity } from "lucide-react";

interface ResultsTableProps {
  results: OptimizationResult | null;
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (!results) {
    return null; // Or a placeholder indicating no results yet
  }

  const { allocations, metrics } = results;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            Portfolio Metrics
          </CardTitle>
          <CardDescription>Key performance indicators for the optimized portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div className="flex flex-col p-3 bg-secondary/50 rounded-md">
              <dt className="text-sm font-medium text-muted-foreground flex items-center">
                <Activity className="mr-1.5 h-4 w-4" /> Expected Return
              </dt>
              <dd className="mt-1 text-xl font-semibold text-primary">
                {metrics.expectedReturn.toFixed(2)}%
              </dd>
            </div>
            <div className="flex flex-col p-3 bg-secondary/50 rounded-md">
              <dt className="text-sm font-medium text-muted-foreground flex items-center">
                <AlertTriangle className="mr-1.5 h-4 w-4" /> Risk (Volatility)
              </dt>
              <dd className="mt-1 text-xl font-semibold text-primary">
                {metrics.risk.toFixed(2)}%
              </dd>
            </div>
            {metrics.sharpeRatio !== undefined && (
              <div className="flex flex-col p-3 bg-secondary/50 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <Percent className="mr-1.5 h-4 w-4" /> Sharpe Ratio
                </dt>
                <dd className="mt-1 text-xl font-semibold text-primary">
                  {metrics.sharpeRatio.toFixed(2)}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Asset Allocations
          </CardTitle>
          <CardDescription>Recommended asset distribution for the optimized portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          {allocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Asset</TableHead>
                  <TableHead className="text-right">Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((item) => (
                  <TableRow key={item.asset}>
                    <TableCell className="font-medium">{item.asset}</TableCell>
                    <TableCell className="text-right">{item.allocation.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No allocation data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
