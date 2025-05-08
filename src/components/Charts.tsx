// src/components/Charts.tsx
"use client";

import type * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AllocationChartData, RiskReturnChartData, OptimizationResult } from "@/types/portfolio";
import { PieChartIcon, TrendingUpIcon } from "lucide-react"; // Using Lucide icons for consistency

interface ChartsProps {
  results: OptimizationResult | null;
}

// Helper to generate distinct colors for the bar chart
const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))', // Deep Teal from theme
  'hsl(var(--accent))',   // Bright Green from theme
];

export function Charts({ results }: ChartsProps) {
  if (!results) {
    return null; // Or a placeholder
  }

  const allocationData: AllocationChartData[] = results.allocations.map((alloc, index) => ({
    name: alloc.asset,
    value: alloc.allocation,
    fill: COLORS[index % COLORS.length],
  }));

  const riskReturnData: RiskReturnChartData[] | undefined = results.efficientFrontierData;

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {allocationData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <PieChartIcon className="mr-2 h-6 w-6 text-primary" />
              Allocation Breakdown
            </CardTitle>
            <CardDescription>Visual representation of asset allocations.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allocationData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" unit="%" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" width={80} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="value" name="Allocation" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {riskReturnData && riskReturnData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUpIcon className="mr-2 h-6 w-6 text-primary" />
              Efficient Frontier / Risk vs. Return
            </CardTitle>
            <CardDescription>Portfolio risk against expected return (Monte Carlo).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="risk" 
                  name="Risk (Volatility)" 
                  unit="%" 
                  stroke="hsl(var(--foreground))"
                  label={{ value: "Risk (Volatility %)", position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="return" 
                  name="Expected Return" 
                  unit="%" 
                  stroke="hsl(var(--foreground))"
                  label={{ value: "Expected Return %", angle: -90, position: 'insideLeft', offset: 0, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ZAxis type="number" range={[50, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name === 'return' ? 'Return' : 'Risk']}
                />
                <Scatter name="Portfolios" data={riskReturnData} fill="hsl(var(--primary))" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
