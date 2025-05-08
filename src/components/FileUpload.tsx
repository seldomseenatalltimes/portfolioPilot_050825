// src/components/FileUpload.tsx
"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, CheckCircle, XCircle, List } from "lucide-react"; // Changed ListFiles to List
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilesArray = Array.from(event.target.files || []);
    if (newFilesArray.length > 0) {
      // Standard behavior for file input is to replace selection
      onFilesChange(newFilesArray); 
      toast({
        title: "Files Selected",
        description: `${newFilesArray.length} file(s) ready.`,
        variant: "default",
      });
    }
  };
  
  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(f => f !== fileToRemove);
    onFilesChange(updatedFiles);
    toast({
      title: "File Removed",
      description: `${fileToRemove.name} has been removed.`,
    });
    if (updatedFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the native file input
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="ticker-upload" className="text-sm font-medium">
          Upload Ticker File(s) (CSV or TXT)
        </Label>
        <Input
          id="ticker-upload"
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          multiple // Allow multiple file selection
          onChange={handleInputChange}
          className="flex-grow file:text-primary file:font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 hover:file:bg-primary/20"
          aria-describedby="ticker-upload-help"
        />
        <p id="ticker-upload-help" className="text-xs text-muted-foreground">
          You can select multiple CSV or TXT files.
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <List className="h-4 w-4 mr-2 text-primary" /> {/* Changed ListFiles to List */}
            Selected Files:
          </div>
          <ul className="space-y-1 list-disc list-inside pl-1 max-h-48 overflow-y-auto rounded-md border p-2 bg-secondary/30">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm p-1 rounded hover:bg-secondary/70">
                <span className="truncate" title={file.name}>
                  <CheckCircle className="h-4 w-4 mr-1.5 text-accent inline-block" />
                  {file.name} ({ (file.size / 1024).toFixed(2) } KB)
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveFile(file)} 
                  aria-label={`Remove ${file.name}`}
                  className="h-6 w-6 shrink-0"
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

