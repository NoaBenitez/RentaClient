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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Montant HT */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Montant HT</span>
          <Euro className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-bold text-primary">{results.totalHTBilled.toFixed(2)}€</p>
        <div className="flex items-center gap-1 mt-1">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{billingItemsCount} articles</span>
        </div>
      </Card>

      {/* Coût Total */}
      <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Coût total</span>
          <Euro className="w-4 h-4 text-secondary" />
        </div>
        <p className="text-2xl font-bold text-secondary">{results.totalCost.toFixed(2)}€</p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{totalHours.toFixed(1)}h travaillées</span>
        </div>
      </Card>

      {/* Interventions */}
      <Card className="p-4 bg-muted/50 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Interventions</span>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{interventionCount}</p>
        <div className="flex items-center gap-1 mt-1">
          <Package className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{purchaseArticlesCount} achats</span>
        </div>
      </Card>

      {/* Marge */}
      <Card className={cn(
        "p-4 hover:shadow-lg transition-shadow",
        isPositive 
          ? "bg-gradient-to-br from-success/20 to-success/10 border-success/30" 
          : "bg-gradient-to-br from-destructive/20 to-destructive/10 border-destructive/30"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {hasNetMargin ? "Marge nette" : "Marge brute"}
          </span>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
        </div>
        <p className={cn(
          "text-2xl font-bold",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {displayMargin.toFixed(2)}€
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {displayMarginRate.toFixed(1)}%
          </span>
        </div>
      </Card>
    </div>
  );
};
