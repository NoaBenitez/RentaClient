import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  isUploaded: boolean;
  fileName?: string;
  compact?: boolean;
}

export const FileUpload = ({ label, onFileSelect, isUploaded, fileName, compact }: FileUploadProps) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const innerContent = isUploaded ? (
    <>
      <CheckCircle2 className={cn("text-success mb-2", compact ? "w-8 h-8" : "w-12 h-12 mb-4")} />
      <p className={cn("font-medium text-success", compact ? "text-xs mb-0.5" : "text-sm mb-1")}>Fichier importé</p>
      <p className="text-xs text-muted-foreground truncate max-w-full">{fileName}</p>
    </>
  ) : (
    <>
      <div className={cn("rounded-full bg-primary/10 flex items-center justify-center mb-2", compact ? "w-10 h-10 mb-2" : "w-16 h-16 mb-4")}>
        <Upload className={cn("text-primary", compact ? "w-5 h-5" : "w-8 h-8")} />
      </div>
      <p className={cn("font-medium mb-1", compact ? "text-xs" : "text-sm")}>{label}</p>
      <p className="text-xs text-muted-foreground mb-2">
        Glissez-déposez ou cliquez
      </p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileSpreadsheet className="w-3.5 h-3.5" />
        <span>.xlsx, .xls</span>
      </div>
    </>
  );

  if (compact) {
    return (
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isUploaded
            ? "border border-success bg-success/5 rounded-xl"
            : "border-2 border-dashed rounded-xl hover:border-primary hover:bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label className="flex flex-col items-center justify-center p-4 cursor-pointer">
          <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileInput} />
          {innerContent}
        </label>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isUploaded
          ? "border-success bg-success/5"
          : "border-dashed border-2 hover:border-primary hover:bg-primary/5"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileInput} />
        {innerContent}
      </label>
    </Card>
  );
};
