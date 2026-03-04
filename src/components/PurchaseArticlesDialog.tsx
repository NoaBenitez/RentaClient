import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PurchaseArticle } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PurchaseArticlesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: PurchaseArticle[];
  onArticleToggle: (index: number) => void;
  aiScores: Map<string, { score: number; reason: string }>;
}

export const PurchaseArticlesDialog = ({
  open,
  onOpenChange,
  articles,
  onArticleToggle,
  aiScores,
}: PurchaseArticlesDialogProps) => {
  const selectedCount = articles.filter(a => a.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            Articles Achetés
            <Badge variant="secondary" className="ml-2">
              {selectedCount} / {articles.length} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-2">
            {articles.map((article, index) => {
              const aiScore = aiScores.get(article.refPsl);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={article.selected}
                    onCheckedChange={() => onArticleToggle(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{article.famille}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {article.refPsl}
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
                    <p className="text-lg font-semibold mb-1">
                      {article.prixAchatRetenu.toFixed(2)} €
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">Réf: {article.refPsl}</p>
                    <p className="font-medium mb-1">{article.designationPsl}</p>
                    {article.matchedBillingCode && (
                      <p className="text-sm text-primary">
                        → Article de facturation: {article.matchedBillingCode}
                      </p>
                    )}
                    {aiScore && aiScore.reason && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {aiScore.reason}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {article.prixAchat2023 > 0 && (
                        <span>2023: {article.prixAchat2023.toFixed(2)} €</span>
                      )}
                      {article.prixAchat2024 > 0 && (
                        <span>2024: {article.prixAchat2024.toFixed(2)} €</span>
                      )}
                      {article.prixAchat2025 > 0 && (
                        <span>2025: {article.prixAchat2025.toFixed(2)} €</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Prix {article.prixAchat2025 > 0 ? '2025' : article.prixAchat2024 > 0 ? '2024' : '2023'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
