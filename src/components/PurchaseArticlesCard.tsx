import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PurchaseArticle } from "@/types";
import { Sparkles, Eye, Loader2 } from "lucide-react";

interface PurchaseArticlesCardProps {
  articles: PurchaseArticle[];
  onArticleToggle: (index: number) => void;
  onAiMatch: () => void;
  isAiLoading: boolean;
  onOpenDialog: () => void;
  aiScores: Map<string, { score: number; reason: string }>;
}

export const PurchaseArticlesCard = ({
  articles,
  onArticleToggle,
  onAiMatch,
  isAiLoading,
  onOpenDialog,
  aiScores,
}: PurchaseArticlesCardProps) => {
  const selectedCount = articles.filter(a => a.selected).length;
  const totalCost = articles
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.prixAchatRetenu, 0);

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold">Articles Achetés</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCount} article{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAiMatch}
            disabled={isAiLoading || articles.length === 0}
            className="gap-2"
          >
            {isAiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isAiLoading ? 'Analyse...' : 'Match IA'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDialog}
            disabled={articles.length === 0}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir tout
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun article trouvé
            </p>
          ) : (
            articles.slice(0, 10).map((article, index) => {
              const aiScore = aiScores.get(article.refPsl);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={article.selected}
                    onCheckedChange={() => onArticleToggle(index)}
                    className="mt-1"
                  />
                   <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {article.famille}
                      </Badge>
                      {aiScore && (
                        <Badge
                          variant={aiScore.score >= 70 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          IA: {aiScore.score}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{article.prixAchatRetenu.toFixed(2)} €</p>
                    <p className="text-xs text-muted-foreground">Réf: {article.refPsl}</p>
                    <p className="text-xs font-medium truncate mt-1">{article.designationPsl}</p>
                    {article.matchedBillingCode && (
                      <p className="text-xs text-primary mt-1">
                        → Lié à: {article.matchedBillingCode}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {article.prixAchat2025 > 0 ? '2025' : article.prixAchat2024 > 0 ? '2024' : '2023'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {articles.length > 10 && (
          <p className="text-xs text-center text-muted-foreground">
            ... et {articles.length - 10} autre{articles.length - 10 > 1 ? 's' : ''} article{articles.length - 10 > 1 ? 's' : ''}
          </p>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Coût total achats:</span>
            <span className="text-primary">{totalCost.toFixed(2)} € HT</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
