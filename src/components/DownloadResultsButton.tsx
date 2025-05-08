// src/components/DownloadResultsButton.tsx
"use client";

import type * as React from "react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileText, FileSpreadsheet, FileArchive } from "lucide-react"; // Using FileArchive as generic doc icon
import type { OptimizationResult, OptimizationMethod, FilterCriteria } from "@/types/portfolio";
import { useToast } from "@/hooks/use-toast";

interface DownloadResultsButtonProps {
  results: OptimizationResult;
  method: OptimizationMethod;
  filters: FilterCriteria;
  uploadedFileNames: string[];
}

export function DownloadResultsButton({ results, method, filters, uploadedFileNames }: DownloadResultsButtonProps) {
  const { toast } = useToast();

  const generateReportHTML = () => {
    const marketCapDisplay = filters.marketCapMin ? `$${filters.marketCapMin.toLocaleString()}` : 'N/A';
    const volumeDisplay = filters.volumeMin ? filters.volumeMin.toLocaleString() : 'N/A';
    const filesDisplay = uploadedFileNames.length > 0 ? uploadedFileNames.join(', ') : 'N/A';

    let htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Portfolio Optimization Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 10pt; }
            h1 { font-size: 18pt; color: #333333; margin-bottom: 15px; }
            h2 { font-size: 14pt; color: #444444; margin-bottom: 10px; border-bottom: 1px solid #eeeeee; padding-bottom: 5px;}
            h3 { font-size: 12pt; color: #555555; margin-bottom: 8px;}
            p { margin-bottom: 5px; line-height: 1.4; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 9pt; }
            th, td { border: 1px solid #dddddd; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            .section { margin-bottom: 25px; padding: 10px; border: 1px solid #eeeeee; border-radius: 5px; background-color: #f9f9f9;}
            .label { font-weight: bold; }
            .header-main { text-align: center; margin-bottom: 25px;}
          </style>
        </head>
        <body>
          <div class="header-main"><h1>Portfolio Optimization Report</h1></div>

          <div class="section">
            <h2>Summary</h2>
            <p><span class="label">Date Generated:</span> ${new Date().toLocaleString()}</p>
            <p><span class="label">Optimization Method:</span> ${method}</p>
          </div>

          <div class="section">
            <h2>Filters Applied</h2>
            <p><span class="label">Files:</span> ${filesDisplay}</p>
            <p><span class="label">Min. Market Cap:</span> ${marketCapDisplay}</p>
            <p><span class="label">Min. Volume:</span> ${volumeDisplay}</p>
            <p><span class="label">Data Interval:</span> ${filters.interval}</p>
          </div>

          <div class="section">
            <h2>Portfolio Metrics</h2>
            <p><span class="label">Expected Return:</span> ${results.metrics.expectedReturn.toFixed(2)}%</p>
            <p><span class="label">Risk (Volatility):</span> ${results.metrics.risk.toFixed(2)}%</p>
            <p><span class="label">Sharpe Ratio:</span> ${results.metrics.sharpeRatio !== undefined ? results.metrics.sharpeRatio.toFixed(2) : 'N/A'}</p>
          </div>

          <div class="section">
            <h2>Asset Allocations</h2>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Allocation (%)</th>
                </tr>
              </thead>
              <tbody>
                ${results.allocations.map(alloc => `<tr><td>${alloc.asset}</td><td>${alloc.allocation.toFixed(2)}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    return htmlContent;
  };

  const handleDownload = async (format: "docx" | "pdf" | "xlsx") => {
    toast({ title: "Generating Report...", description: `Preparing ${format.toUpperCase()} file.` });
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Portfolio_Report_${timestamp}`;

      if (format === "docx") {
        const htmlContent = generateReportHTML();
        const fileBuffer = await htmlToDocx(htmlContent, undefined, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
        });
        saveAs(fileBuffer as Blob, `${filename}.docx`);
      } else if (format === "pdf") {
        const doc = new jsPDF();
        const marketCapDisplay = filters.marketCapMin ? `$${filters.marketCapMin.toLocaleString()}` : 'N/A';
        const volumeDisplay = filters.volumeMin ? filters.volumeMin.toLocaleString() : 'N/A';
        const filesDisplay = uploadedFileNames.length > 0 ? uploadedFileNames.join(', ') : 'N/A';

        doc.setFontSize(18);
        doc.text("Portfolio Optimization Report", 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 35);
        doc.text(`Optimization Method: ${method}`, 14, 42);

        doc.setFontSize(14);
        doc.text("Filters Applied", 14, 55);
        doc.setFontSize(10);
        autoTable(doc, {
          startY: 60,
          head: [['Filter', 'Value']],
          body: [
            ['Files', filesDisplay],
            ['Min. Market Cap', marketCapDisplay],
            ['Min. Volume', volumeDisplay],
            ['Data Interval', filters.interval],
          ],
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0,0,0] },
        });
        
        let currentY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(14);
        doc.text("Portfolio Metrics", 14, currentY);
        doc.setFontSize(10);
        autoTable(doc, {
            startY: currentY + 5,
            head: [['Metric', 'Value']],
            body: [
                ['Expected Return', `${results.metrics.expectedReturn.toFixed(2)}%`],
                ['Risk (Volatility)', `${results.metrics.risk.toFixed(2)}%`],
                ['Sharpe Ratio', results.metrics.sharpeRatio !== undefined ? results.metrics.sharpeRatio.toFixed(2) : 'N/A'],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [220, 220, 220], textColor: [0,0,0] },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFontSize(14);
        doc.text("Asset Allocations", 14, currentY);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Asset', 'Allocation (%)']],
          body: results.allocations.map(alloc => [alloc.asset, `${alloc.allocation.toFixed(2)}%`]),
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0,0,0] },
        });

        doc.save(`${filename}.pdf`);

      } else if (format === "xlsx") {
        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
          ["Portfolio Optimization Report"],
          [],
          ["Date Generated", new Date().toLocaleString()],
          ["Optimization Method", method],
          [],
          ["Filters Applied"],
          ["Files", uploadedFileNames.join(', ')],
          ["Min. Market Cap", filters.marketCapMin ? `$${filters.marketCapMin.toLocaleString()}` : 'N/A'],
          ["Min. Volume", filters.volumeMin ? filters.volumeMin.toLocaleString() : 'N/A'],
          ["Data Interval", filters.interval],
          [],
          ["Portfolio Metrics"],
          ["Expected Return", `${results.metrics.expectedReturn.toFixed(2)}%`],
          ["Risk (Volatility)", `${results.metrics.risk.toFixed(2)}%`],
          ["Sharpe Ratio", results.metrics.sharpeRatio !== undefined ? results.metrics.sharpeRatio.toFixed(2) : 'N/A'],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // Allocations Sheet
        const allocationsData = results.allocations.map(alloc => ({
          Asset: alloc.asset,
          "Allocation (%)": alloc.allocation,
        }));
        const wsAllocations = XLSX.utils.json_to_sheet(allocationsData);
        XLSX.utils.book_append_sheet(wb, wsAllocations, "Asset Allocations");
        
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
      toast({ title: "Report Downloaded", description: `${filename}.${format} has been saved.`, variant: "default" });
    } catch (error) {
      console.error("Failed to download report:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Download Failed", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <FileDown className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("docx")}>
          <FileArchive className="mr-2 h-4 w-4" /> {/* Using FileArchive as generic doc icon */}
          Download as .docx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          Download as .pdf
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("xlsx")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Download as .xlsx
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
