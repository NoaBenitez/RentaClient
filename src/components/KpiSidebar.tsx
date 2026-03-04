import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Wrench, Car, Briefcase, Percent } from "lucide-react";
import { FinancialResults } from "@/types";
import { cn } from "@/lib/utils";

interface KpiSidebarProps {
  results: FinancialResults;
  interventionCount: number;
  totalHours: number;
  billingItemsCount: number;
  purchaseArticlesCount: number;
}

export const KpiSidebar = ({
  results,
  interventionCount,
  totalHours,
  billingItemsCount,
}: KpiSidebarProps) => {
  const hasNetMargin = results.hasPurchaseData && results.netMargin !== undefined;
  const displayMargin = hasNetMargin ? results.netMargin! : results.grossMargin;
  const isPositive = displayMargin >= 0;
  const displayMarginRate = hasNetMargin && results.totalHTBilled > 0
    ? (results.netMargin! / results.totalHTBilled) * 100
    : results.marginRate;
  const marginLabel = hasNetMargin ? "Marge nette" : "Marge brute";
  const progressValue = Math.max(0, Math.min(100, displayMarginRate));

  const costs = [
    { label: "Main d'œuvre", value: results.interventionCost, icon: Wrench },
    { label: "Déplacement", value: results.travelCost, icon: Briefcase },
    { label: "Véhicule", value: results.vehicleCost, icon: Car },
    { label: "Frais financier", value: results.financialFee, icon: Percent },
    { label: "Frais structure", value: results.structureFee, icon: Percent },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          Résultats financiers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Montant HT */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">Montant HT facturé</p>
          <p className="text-3xl font-bold text-primary">{results.totalHTBilled.toFixed(2)}€</p>
          <p className="text-xs text-muted-foreground mt-1">
            {billingItemsCount} article{billingItemsCount !== 1 ? "s" : ""} sélectionné{billingItemsCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Marge avec progress bar */}
        <div className={cn(
          "p-4 rounded-xl border-2",
          isPositive ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
        )}>
          <p className={cn(
            "text-xs font-medium uppercase tracking-wide mb-1",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {marginLabel}
          </p>
          <p className={cn("text-3xl font-bold mb-3", isPositive ? "text-success" : "text-destructive")}>
            {displayMargin.toFixed(2)}€
          </p>
          <Progress
            value={progressValue}
            className={cn("h-2 mb-2", !isPositive && "[&>div]:bg-destructive")}
          />
          <p className={cn("text-sm font-semibold", isPositive ? "text-success" : "text-destructive")}>
            {displayMarginRate.toFixed(1)}%
          </p>
        </div>

        <Separator />

        {/* Coût total */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">Coût total</span>
          <span className="font-bold text-lg tabular-nums">{results.totalCost.toFixed(2)}€</span>
        </div>

        {/* Détail des coûts */}
        <div className="space-y-2">
          {costs.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-3 h-3 shrink-0" />
                <span>{label}</span>
              </div>
              <span className="font-medium tabular-nums">{value.toFixed(2)}€</span>
            </div>
          ))}
          {results.hasPurchaseData && results.purchaseArticlesCost !== undefined && (
            <>
              <Separator className="my-1" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Coût achats</span>
                <span className="font-medium tabular-nums">{results.purchaseArticlesCost.toFixed(2)}€</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Stats interventions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">{interventionCount}</p>
            <p className="text-xs text-muted-foreground">interventions</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold">
              {totalHours.toFixed(1)}<span className="text-sm font-medium">h</span>
            </p>
            <p className="text-xs text-muted-foreground">total heures</p>
          </div>
        </div>

        {!results.hasPurchaseData && (
          <p className="text-xs text-muted-foreground text-center italic border border-dashed rounded-lg p-2">
            Importez les articles pour calculer la marge nette
          </p>
        )}
      </CardContent>
    </Card>
  );
};
