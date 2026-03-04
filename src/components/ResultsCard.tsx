import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Percent } from "lucide-react";
import { FinancialResults } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResultsCardProps {
  results: FinancialResults;
  travelCost: number;
  onTravelCostChange: (value: number) => void;
  vehicleHours: number;
  onVehicleHoursChange: (value: number) => void;
  vehicleRate: number;
  onVehicleRateChange: (value: number) => void;
  financialFeeRate: number;
  onFinancialFeeRateChange: (value: number) => void;
  structureFeeRate: number;
  onStructureFeeRateChange: (value: number) => void;
}

export const ResultsCard = ({ 
  results, 
  travelCost, 
  onTravelCostChange,
  vehicleHours,
  onVehicleHoursChange,
  vehicleRate,
  onVehicleRateChange,
  financialFeeRate,
  onFinancialFeeRateChange,
  structureFeeRate,
  onStructureFeeRateChange
}: ResultsCardProps) => {
  // Determine which margin to display
  const hasNetMargin = results.hasPurchaseData && results.netMargin !== undefined;
  const displayMargin = hasNetMargin ? results.netMargin! : results.grossMargin;
  const isPositive = displayMargin >= 0;
  const displayMarginRate = hasNetMargin && results.totalHTBilled > 0
    ? (results.netMargin! / results.totalHTBilled) * 100
    : results.marginRate;
  const marginLabel = hasNetMargin ? "Marge nette" : "Marge brute";
  const marginRateLabel = hasNetMargin ? "Taux de marge nette" : "Taux de marge brute";

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-destructive" />
          )}
          Résultats Financiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Montant HT facturé</span>
              <Euro className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{results.totalHTBilled.toFixed(2)}€</p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Coût des interventions</span>
              <Euro className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{results.interventionCost.toFixed(2)}€</p>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div>
              <Label htmlFor="travel-cost" className="text-sm text-muted-foreground">Frais déplacement</Label>
              <Input
                id="travel-cost"
                type="number"
                min="0"
                step="0.01"
                value={travelCost || ""}
                onChange={(e) => onTravelCostChange(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-3">
            <Label className="text-sm text-muted-foreground">Frais véhicule</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vehicle-hours" className="text-xs">Heures</Label>
                <Input
                  id="vehicle-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={vehicleHours || ""}
                  onChange={(e) => onVehicleHoursChange(Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="vehicle-rate" className="text-xs">Taux horaire (€/h)</Label>
                <Input
                  id="vehicle-rate"
                  type="number"
                  min="0"
                  step="0.5"
                  value={vehicleRate || ""}
                  onChange={(e) => onVehicleRateChange(Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-lg font-bold">{results.vehicleCost.toFixed(2)}€</p>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="financial-fee" className="text-sm text-muted-foreground">Frais financier (%)</Label>
              <Input
                id="financial-fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={financialFeeRate || ""}
                onChange={(e) => onFinancialFeeRateChange(Number(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-lg font-bold">{results.financialFee.toFixed(2)}€</p>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="structure-fee" className="text-sm text-muted-foreground">Frais structure (%)</Label>
              <Input
                id="structure-fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={structureFeeRate || ""}
                onChange={(e) => onStructureFeeRateChange(Number(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-lg font-bold">{results.structureFee.toFixed(2)}€</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-secondary">Coût total</span>
              <Euro className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary">{results.totalCost.toFixed(2)}€</p>
          </div>

          {results.hasPurchaseData && results.purchaseArticlesCost !== undefined && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-primary">Coût achats articles</span>
                <Euro className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{results.purchaseArticlesCost.toFixed(2)}€</p>
            </div>
          )}

          {!results.hasPurchaseData && (
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground text-center italic">
                Marge brute indisponible - Importez le fichier articles pour calculer la marge nette
              </p>
            </div>
          )}

          <div
            className={cn(
              "p-6 rounded-lg border-2",
              isPositive
                ? "bg-success/10 border-success/30"
                : "bg-destructive/10 border-destructive/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {marginLabel}
              </span>
              <Euro className={cn(
                "w-5 h-5",
                isPositive ? "text-success" : "text-destructive"
              )} />
            </div>
            <p className={cn(
              "text-4xl font-bold mb-4",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {displayMargin.toFixed(2)}€
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-current/20">
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {marginRateLabel}
              </span>
              <div className="flex items-center gap-2">
                <Percent className={cn(
                  "w-4 h-4",
                  isPositive ? "text-success" : "text-destructive"
                )} />
                <span className={cn(
                  "text-2xl font-bold",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  {displayMarginRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
