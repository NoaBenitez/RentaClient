import { CheckCircle2, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SetupStepChipProps {
  step: number;
  label: string;
  isUploaded: boolean;
  fileName?: string;
  children: React.ReactNode;
}

export const SetupStepChip = ({ step, label, isUploaded, fileName, children }: SetupStepChipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 cursor-pointer",
            isUploaded
              ? "border-success bg-success/10 text-success hover:bg-success/20"
              : "border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 text-foreground"
          )}
        >
          <span
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              isUploaded ? "bg-success text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {isUploaded ? <CheckCircle2 className="w-3 h-3" /> : step}
          </span>
          <span>{label}</span>
          {isUploaded && fileName && (
            <span className="text-xs opacity-70 max-w-[120px] truncate hidden sm:inline">{fileName}</span>
          )}
          {!isUploaded && <Upload className="w-3.5 h-3.5 opacity-60 ml-1" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start" sideOffset={8}>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Étape {step} : {label}</p>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};
