import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Percent, ArrowRight } from "lucide-react";
import { FinancialResults } from "@/types";
import { cn } from "@/lib/utils";

interface AnalysisResultsCardProps {
  results: FinancialResults;
}

export const AnalysisResultsCard = ({ results }: AnalysisResultsCardProps) => {
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
          {/* Revenue Section */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-primary">Montant HT facturé</span>
              <Euro className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{results.totalHTBilled.toFixed(2)}€</p>
          </div>

          {/* Costs Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Détail des coûts
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Main d'œuvre</span>
                <p className="text-lg font-semibold">{results.interventionCost.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Déplacement</span>
                <p className="text-lg font-semibold">{results.travelCost.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Véhicule</span>
                <p className="text-lg font-semibold">{results.vehicleCost.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Frais financier</span>
                <p className="text-lg font-semibold">{results.financialFee.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                <span className="text-xs text-muted-foreground">Frais structure</span>
                <p className="text-lg font-semibold">{results.structureFee.toFixed(2)}€</p>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-secondary">Coût total</span>
              <Euro className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary">{results.totalCost.toFixed(2)}€</p>
          </div>

          {/* Purchase Articles Cost */}
          {results.hasPurchaseData && results.purchaseArticlesCost !== undefined && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Coût achats articles</span>
                <Euro className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{results.purchaseArticlesCost.toFixed(2)}€</p>
            </div>
          )}

          {/* No Purchase Data Message */}
          {!results.hasPurchaseData && (
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground text-center italic">
                Marge brute indisponible - Importez le fichier articles pour calculer la marge nette
              </p>
            </div>
          )}

          {/* Margin Display */}
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
