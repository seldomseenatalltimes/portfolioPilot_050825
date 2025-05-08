// src/app/page.tsx
"use client";

import type * as React from "react";
import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { FiltersForm } from "@/components/FiltersForm";
import { OptimizerSelect } from "@/components/OptimizerSelect";
import { ResultsTable } from "@/components/ResultsTable";
import { Charts } from "@/components/Charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Settings, BarChartHorizontalBig, SlidersHorizontal, FileText, TrendingUp, Palette } from "lucide-react";
import type { FilterCriteria, OptimizationMethod, OptimizationParams, OptimizationResult } from "@/types/portfolio";
import { optimizePortfolio, uploadTickers } from "@/lib/api"; 
import { useToast } from "@/hooks/use-toast";

export default function PortfolioPilotPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({
    marketCapMin: null, 
    volumeMin: null,    
    interval: "daily",
  });
  const [selectedMethod, setSelectedMethod] = useState<OptimizationMethod>("Modern Portfolio Theory");
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilesChange = (newFiles: File[]) => {
    setUploadedFiles(newFiles);
    setOptimizationResults(null); 
    setError(null);
  };

  const handleFiltersChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  const handleMethodChange = (method: OptimizationMethod) => {
    setSelectedMethod(method);
  };

  const handleOptimize = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one CSV or TXT file with ticker data.");
      toast({
        title: "Error",
        description: "No CSV or TXT files uploaded.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizationResults(null);

    try {
      const uploadResponse = await uploadTickers(uploadedFiles); 
      toast({
        title: "Files Processed",
        description: uploadResponse.message,
      });

      if (uploadResponse.processedFileNames.length === 0) {
        setError("No valid files were processed. Please check file types and try again.");
        toast({
          title: "Processing Error",
          description: "No valid files could be processed.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const params: OptimizationParams = {
        uploadedFileNames: uploadResponse.processedFileNames,
        filters,
        method: selectedMethod,
      };
      const results = await optimizePortfolio(params);
      setOptimizationResults(results);
      toast({
        title: "Optimization Successful",
        description: `Portfolio optimized using ${selectedMethod}.`,
        variant: "default",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during optimization.";
      setError(errorMessage);
      toast({
        title: "Optimization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Palette className="h-8 w-8 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">PortfolioPilot</h1>
          </div>
           <a 
            href="https://github.com/your-repo/portfolio-pilot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm hover:underline"
            aria-label="View source code on GitHub"
          >
            View on GitHub
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="bg-card-foreground/5">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="mr-2 h-6 w-6 text-primary" />
                  Data Input
                </CardTitle>
                <CardDescription>Upload your ticker data (CSV/TXT) to begin.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FileUpload 
                  files={uploadedFiles}
                  onFilesChange={handleFilesChange} 
                />
              </CardContent>
            </Card>

            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="bg-card-foreground/5">
                <CardTitle className="flex items-center text-xl">
                  <SlidersHorizontal className="mr-2 h-6 w-6 text-primary" />
                  Filtering Options
                </CardTitle>
                <CardDescription>Refine data based on your criteria.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FiltersForm initialFilters={filters} onFiltersChange={handleFiltersChange} />
              </CardContent>
            </Card>

            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="bg-card-foreground/5">
                <CardTitle className="flex items-center text-xl">
                  <Settings className="mr-2 h-6 w-6 text-primary" />
                  Optimization Setup
                </CardTitle>
                <CardDescription>Choose your optimization model.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <OptimizerSelect selectedMethod={selectedMethod} onMethodChange={handleMethodChange} />
              </CardContent>
            </Card>

            <Button
              onClick={handleOptimize}
              disabled={isLoading || uploadedFiles.length === 0}
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
              aria-label="Run portfolio optimization"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-5 w-5" />
              )}
              Optimize Portfolio
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isLoading && (
              <Card className="shadow-xl flex flex-col items-center justify-center p-10 min-h-[300px] bg-card">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-foreground">Optimizing your portfolio...</p>
                <p className="text-sm text-muted-foreground">This may take a moment.</p>
              </Card>
            )}

            {error && !isLoading && (
              <Card className="shadow-xl border-destructive bg-destructive/10 p-6">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="flex items-center text-destructive">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    Optimization Error
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && optimizationResults && (
              <>
                <Card className="shadow-xl overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center text-2xl">
                       <BarChartHorizontalBig className="mr-3 h-7 w-7" />
                       Optimization Results
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Based on {selectedMethod} model using {paramsToString(filters, uploadedFiles)}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <ResultsTable results={optimizationResults} />
                    <Separator className="my-6"/>
                    <Charts results={optimizationResults} />
                  </CardContent>
                </Card>
              </>
            )}
             {!isLoading && !error && !optimizationResults && (
                <Card className="shadow-xl flex flex-col items-center justify-center p-10 min-h-[300px] bg-card">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">Ready to Optimize</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Upload your CSV/TXT files, set filters, choose a method, and click "Optimize Portfolio" to see results.
                  </p>
                </Card>
             )}
          </div>
        </div>
      </main>
       <footer className="py-6 mt-12 text-center text-muted-foreground text-sm border-t border-border">
        <p>&copy; {new Date().getFullYear()} PortfolioPilot. All rights reserved.</p>
        <p>Data processing and optimization are simulated for demonstration.</p>
      </footer>
    </div>
  );
}

// Helper function to display parameters in card description
function paramsToString(filters: FilterCriteria, files: File[]): string {
  const fileNames = files.map(f => f.name).join(', ');
  return `files: ${fileNames.length > 50 ? fileNames.substring(0,47) + '...' : fileNames || 'N/A'}. Filters: Market Cap Min: ${filters.marketCapMin ?? 'Any'}, Volume Min: ${filters.volumeMin ?? 'Any'}, Interval: ${filters.interval}.`;
}
