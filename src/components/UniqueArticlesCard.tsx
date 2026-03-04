import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Euro } from "lucide-react";
import { BillingItem } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface UniqueArticle {
  codeArticle: string;
  description: string;
  familleArticle: string;
  averagePrice: number;
  totalQuantity: number;
}

interface UniqueArticlesCardProps {
  items: BillingItem[];
}

export const UniqueArticlesCard = ({ items }: UniqueArticlesCardProps) => {
  const uniqueArticles = useMemo(() => {
    const articlesMap = new Map<string, {
      description: string;
      familleArticle: string;
      prices: number[];
      totalQuantity: number;
    }>();

    items.forEach(item => {
      if (!articlesMap.has(item.codeArticle)) {
        articlesMap.set(item.codeArticle, {
          description: item.description,
          familleArticle: item.familleArticle,
          prices: [],
          totalQuantity: 0
        });
      }
      
      const article = articlesMap.get(item.codeArticle)!;
      article.prices.push(item.prixUnitaireHT);
      article.totalQuantity += item.quantite;
    });

    const result: UniqueArticle[] = Array.from(articlesMap.entries()).map(([code, data]) => ({
      codeArticle: code,
      description: data.description,
      familleArticle: data.familleArticle,
      averagePrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
      totalQuantity: data.totalQuantity
    }));

    // Sort by family, then by description
    return result.sort((a, b) => {
      if (a.familleArticle !== b.familleArticle) {
        return a.familleArticle.localeCompare(b.familleArticle);
      }
      return a.description.localeCompare(b.description);
    });
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Articles uniques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {uniqueArticles.map((article) => (
              <div
                key={article.codeArticle}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-sm line-clamp-2">{article.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Code: {article.codeArticle}</span>
                      <Badge variant="outline" className="text-xs">
                        {article.familleArticle}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <Euro className="w-3 h-3 text-muted-foreground" />
                      <p className="font-bold text-sm">{article.averagePrice.toFixed(2)}€</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Prix moyen</p>
                    <p className="text-sm font-semibold">Qté: {article.totalQuantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
