// src/components/FileUpload.tsx
"use client";

import type * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  uploadedFileName: string | null;
  setUploadedFileName: (name: string | null) => void;
}

export function FileUpload({ onFileChange, uploadedFileName, setUploadedFileName }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Placeholder for actual upload state
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      // Simulate an upload process or directly pass file for parent processing
      // For this example, we'll just set it and let parent "process" it on optimize.
      setUploadedFileName(file.name); 
      onFileChange(file);
      toast({
        title: "File Selected",
        description: `${file.name} is ready.`,
        variant: "default",
      });
    } else {
      setUploadedFileName(null);
      onFileChange(null);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFileName(null);
    onFileChange(null);
    // Also clear the input field value
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    toast({
      title: "File Removed",
      description: "The selected file has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="csv-upload" className="text-sm font-medium">
          Upload Ticker CSV
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-grow file:text-primary file:font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 hover:file:bg-primary/20"
            disabled={isUploading || !!uploadedFileName}
            aria-describedby="csv-upload-help"
          />
          {uploadedFileName && (
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} aria-label="Remove file">
              <XCircle className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </div>
        <p id="csv-upload-help" className="text-xs text-muted-foreground">
          Please upload a CSV file with your ticker data.
        </p>
      </div>

      {uploadedFileName && !isUploading && (
        <div className="flex items-center p-3 rounded-md bg-accent/10 text-accent-foreground border border-accent">
          <CheckCircle className="h-5 w-5 mr-2 text-accent" />
          <span className="text-sm font-medium">{uploadedFileName} selected.</span>
        </div>
      )}
      {isUploading && (
         <div className="flex items-center p-3 rounded-md bg-blue-500/10 text-blue-700">
          <FileUp className="h-5 w-5 mr-2 animate-pulse" />
          <span className="text-sm font-medium">Processing {selectedFile?.name}...</span>
        </div>
      )}
    </div>
  );
}
