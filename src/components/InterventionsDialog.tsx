import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Intervention } from "@/types";
import { calculateHoursFromTimeSlot, getInterventionId } from "@/utils/excelParser";
import { useMemo } from "react";

interface InterventionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventions: Intervention[];
  selectedInterventions: Set<string>;
  onInterventionToggle: (interventionId: string) => void;
  aiScores?: Map<string, { score: number; reason: string }>;
}

interface GroupedInterventions {
  name: string;
  interventions: Intervention[];
  aiScore?: { score: number; reason: string };
}

export const InterventionsDialog = ({
  open,
  onOpenChange,
  interventions,
  selectedInterventions,
  onInterventionToggle,
  aiScores,
}: InterventionsDialogProps) => {
  // Group interventions by name
  const groupedInterventions = useMemo(() => {
    const groups = new Map<string, Intervention[]>();
    
    interventions.forEach(intervention => {
      const existing = groups.get(intervention.nomIntervention) || [];
      groups.set(intervention.nomIntervention, [...existing, intervention]);
    });
    
    return Array.from(groups.entries()).map(([name, groupInterventions]) => ({
      name,
      interventions: groupInterventions,
      aiScore: aiScores?.get(name)
    })).sort((a, b) => {
      // Sort by AI score if available (highest first)
      const scoreA = a.aiScore?.score ?? 0;
      const scoreB = b.aiScore?.score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    });
  }, [interventions, aiScores]);

  const totalSelectedHours = useMemo(() => {
    return interventions
      .filter(i => selectedInterventions.has(getInterventionId(i)))
      .reduce((sum, i) => sum + calculateHoursFromTimeSlot(i.horaires), 0);
  }, [interventions, selectedInterventions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélection des interventions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {groupedInterventions.map((group) => (
              <div key={group.name} className="space-y-2">
                {/* Group header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                  <span className="font-semibold text-sm">{group.name}</span>
                  {group.aiScore && (
                    <Badge 
                      variant={group.aiScore.score >= 70 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {group.aiScore.score}% IA
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {group.interventions.length} intervention{group.interventions.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Individual interventions in the group */}
                <div className="ml-4 space-y-1">
                  {group.interventions.map((intervention) => {
                    const interventionId = getInterventionId(intervention);
                    const isSelected = selectedInterventions.has(interventionId);
                    
                    return (
                      <div
                        key={interventionId}
                        className="flex items-start gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => onInterventionToggle(interventionId)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onInterventionToggle(interventionId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium">{calculateHoursFromTimeSlot(intervention.horaires).toFixed(1)}h</span>
                            <span>•</span>
                            <span>{intervention.date.toLocaleDateString('fr-FR')}</span>
                            <span>•</span>
                            <span>{intervention.technicien}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* AI reason for the group if available */}
                {group.aiScore?.reason && (
                  <p className="text-xs text-muted-foreground ml-4 italic px-2">
                    {group.aiScore.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {selectedInterventions.size} / {interventions.length} interventions sélectionnées
          </span>
          <span className="text-sm font-medium">
            Total: {totalSelectedHours.toFixed(1)}h
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
