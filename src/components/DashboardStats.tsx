import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Clock, FileText, Package } from "lucide-react";
import { FinancialResults } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  results: FinancialResults;
  interventionCount: number;
  totalHours: number;
  billingItemsCount: number;
  purchaseArticlesCount: number;
}

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const DashboardStats = ({
  results,
  interventionCount,
  totalHours,
  billingItemsCount,
  purchaseArticlesCount,
}: DashboardStatsProps) => {
  const hasNetMargin = results.hasPurchaseData && results.netMargin !== undefined;
  const displayMargin = hasNetMargin ? results.netMargin! : results.grossMargin;
  const isPositive = displayMargin >= 0;
  const displayMarginRate = hasNetMargin && results.totalHTBilled > 0
    ? (results.netMargin! / results.totalHTBilled) * 100
    : results.marginRate;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Montant HT */}
      <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-stagger-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Montant HT</span>
          <Euro className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-xl font-bold text-primary tabular-nums">{fmt(results.totalHTBilled)} €</p>
        <div className="flex items-center gap-1 mt-1">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{billingItemsCount} articles</span>
        </div>
      </Card>

      {/* Coût Total */}
      <Card className="p-3 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-stagger-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Coût total</span>
          <Euro className="w-3.5 h-3.5 text-secondary" />
        </div>
        <p className="text-xl font-bold text-secondary tabular-nums">{fmt(results.totalCost)} €</p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{fmt(totalHours, 1)}h travaillées</span>
        </div>
      </Card>

      {/* Interventions */}
      <Card className="p-3 bg-muted/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-stagger-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Interventions</span>
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold tabular-nums">{interventionCount}</p>
        <div className="flex items-center gap-1 mt-1">
          <Package className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{purchaseArticlesCount} achats</span>
        </div>
      </Card>

      {/* Marge */}
      <Card className={cn(
        "p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-stagger-4",
        isPositive
          ? "bg-gradient-to-br from-success/20 to-success/10 border-success/30"
          : "bg-gradient-to-br from-destructive/20 to-destructive/10 border-destructive/30"
      )}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {hasNetMargin ? "Marge nette" : "Marge brute"}
          </span>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
        </div>
        <p className={cn(
          "text-xl font-bold tabular-nums",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {fmt(displayMargin)} €
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className={cn(
            "text-[10px] font-medium tabular-nums",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {fmt(displayMarginRate, 1)} %
          </span>
        </div>
      </Card>
    </div>
  );
};
