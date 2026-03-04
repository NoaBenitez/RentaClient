import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Euro } from "lucide-react";
import { BillingItem } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BillingCardProps {
  items: BillingItem[];
  onItemToggle: (index: number) => void;
  articleFamilies: string[];
  selectedFamilies: Set<string>;
  onFamilyToggle: (family: string) => void;
}

export const BillingCard = ({ items, onItemToggle, articleFamilies, selectedFamilies, onFamilyToggle }: BillingCardProps) => {
  const selectedTotal = items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.montantTotalHT, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Facturation
          </CardTitle>
          {articleFamilies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Familles:</span>
              {articleFamilies.map(family => (
                <Badge
                  key={family}
                  variant={selectedFamilies.size === 0 || selectedFamilies.has(family) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => onFamilyToggle(family)}
                >
                  {family}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => onItemToggle(index)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Code: {item.codeArticle}</span>
                    <span>Qté: {item.quantite}</span>
                    <span>Prix unit.: {item.prixUnitaireHT.toFixed(2)}€</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{item.montantTotalHT.toFixed(2)}€</p>
                  <p className="text-xs text-muted-foreground">HT</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Total articles sélectionnés</span>
            </div>
            <span className="text-2xl font-bold text-primary">{selectedTotal.toFixed(2)}€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
