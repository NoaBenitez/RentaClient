import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Euro, List, Sparkles } from "lucide-react";

interface InterventionsCardProps {
  count: number;
  totalHours: number;
  hourlyCost: number;
  onOpenDialog: () => void;
  onAiMatch: () => void;
  isAiLoading: boolean;
}

export const InterventionsCard = ({ count, totalHours, hourlyCost, onOpenDialog, onAiMatch, isAiLoading }: InterventionsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Interventions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAiMatch}
              disabled={isAiLoading}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isAiLoading ? "Analyse..." : "IA"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDialog}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Liste
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Nombre d'interventions</span>
            <span className="text-2xl font-bold text-primary">{count}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total des heures</span>
            </div>
            <span className="text-2xl font-bold">{totalHours.toFixed(1)}h</span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Coût horaire (40€/h)</span>
            </div>
            <span className="text-2xl font-bold text-primary">{hourlyCost.toFixed(2)}€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
