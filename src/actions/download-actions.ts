// src/actions/download-actions.ts
'use server';

import htmlToDocx from 'html-to-docx';
import type { OptimizationResult, OptimizationMethod, FilterCriteria } from "@/types/portfolio";
import { generateReportHTML } from '@/components/DownloadResultsButton'; // Import the HTML generator

interface ReportData {
  results: OptimizationResult;
  method: OptimizationMethod;
  filters: FilterCriteria;
  uploadedFileNames: string[];
}

export async function generateDocxReport(reportData: ReportData): Promise<Blob | null> {
  try {
    const { results, method, filters, uploadedFileNames } = reportData;
    const htmlContent = generateReportHTML(results, method, filters, uploadedFileNames);

    const fileBuffer = await htmlToDocx(htmlContent, undefined, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // htmlToDocx returns a Buffer in Node.js environments, convert it to Blob
    if (fileBuffer instanceof Buffer) {
      return new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    } else if (fileBuffer instanceof Blob) {
        return fileBuffer; // It might already be a Blob in some environments
    } else {
        console.error("htmlToDocx returned an unexpected type:", typeof fileBuffer);
        return null;
    }
  } catch (error) {
    console.error("Error generating DOCX report:", error);
    return null;
  }
}
