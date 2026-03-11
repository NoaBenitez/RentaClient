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

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

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
    { label: "Main d'oeuvre", value: results.interventionCost, icon: Wrench },
    { label: "Déplacement", value: results.travelCost, icon: Briefcase },
    { label: "Véhicule", value: results.vehicleCost, icon: Car },
    { label: "Frais financier", value: results.financialFee, icon: Percent },
    { label: "Frais structure", value: results.structureFee, icon: Percent },
  ];

  return (
    <Card className="border-2 animate-slide-in-left">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success animate-pulse-subtle" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive animate-pulse-subtle" />
          )}
          Résultats financiers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Montant HT */}
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors duration-300">
          <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-0.5">Montant HT facturé</p>
          <p className="text-2xl font-bold text-primary tabular-nums">{fmt(results.totalHTBilled)} €</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {billingItemsCount} article{billingItemsCount !== 1 ? "s" : ""} sélectionné{billingItemsCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Marge avec progress bar */}
        <div className={cn(
          "p-3 rounded-xl border-2 hover:shadow-md transition-all duration-300",
          isPositive ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
        )}>
          <p className={cn(
            "text-[10px] font-medium uppercase tracking-wider mb-0.5",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {marginLabel}
          </p>
          <p className={cn("text-2xl font-bold mb-2 tabular-nums", isPositive ? "text-success" : "text-destructive")}>
            {fmt(displayMargin)} €
          </p>
          <Progress
            value={progressValue}
            className={cn("h-1.5 mb-1.5", !isPositive && "[&>div]:bg-destructive")}
          />
          <p className={cn("text-sm font-semibold tabular-nums", isPositive ? "text-success" : "text-destructive")}>
            {fmt(displayMarginRate, 1)} %
          </p>
        </div>

        <Separator />

        {/* Coût total */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold">Coût total</span>
          <span className="font-bold text-base tabular-nums">{fmt(results.totalCost)} €</span>
        </div>

        {/* Détail des coûts */}
        <div className="space-y-1.5">
          {costs.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex justify-between items-center text-xs group hover:bg-muted/50 rounded-md px-1.5 py-0.5 transition-colors">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="w-3 h-3 shrink-0 group-hover:text-primary transition-colors" />
                <span>{label}</span>
              </div>
              <span className="font-medium tabular-nums">{fmt(value)} €</span>
            </div>
          ))}
          {results.hasPurchaseData && results.purchaseArticlesCost !== undefined && (
            <>
              <Separator className="my-1" />
              <div className="flex justify-between items-center text-xs px-1.5">
                <span className="text-muted-foreground">Coût achats</span>
                <span className="font-medium tabular-nums">{fmt(results.purchaseArticlesCost)} €</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Stats interventions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-muted text-center hover:bg-muted/80 transition-colors">
            <p className="text-xl font-bold tabular-nums">{interventionCount}</p>
            <p className="text-[10px] text-muted-foreground">interventions</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted text-center hover:bg-muted/80 transition-colors">
            <p className="text-xl font-bold tabular-nums">
              {fmt(totalHours, 1)}<span className="text-xs font-medium">h</span>
            </p>
            <p className="text-[10px] text-muted-foreground">total heures</p>
          </div>
        </div>

        {!results.hasPurchaseData && (
          <p className="text-[10px] text-muted-foreground text-center italic border border-dashed rounded-lg p-2">
            Importez les articles pour calculer la marge nette
          </p>
        )}
      </CardContent>
    </Card>
  );
};
