import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

interface KeywordMatch {
  keyword: string;
  interventionCount: number;
  enabled: boolean;
}

interface KeywordSelectorProps {
  keywords: KeywordMatch[];
  onKeywordToggle: (keyword: string) => void;
}

export const KeywordSelector = ({ keywords, onKeywordToggle }: KeywordSelectorProps) => {
  const enabledCount = keywords.filter(k => k.enabled).length;
  const totalMatches = keywords.reduce((sum, k) => sum + (k.enabled ? k.interventionCount : 0), 0);

  if (keywords.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Mots-clés ({enabledCount}/{keywords.length})
          {totalMatches > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalMatches} interventions
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filtrer par mots-clés</h4>
            <p className="text-xs text-muted-foreground">
              Sélectionnez les mots-clés à inclure dans la recherche
            </p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {keywords.map((keyword) => (
              <div
                key={keyword.keyword}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => onKeywordToggle(keyword.keyword)}
              >
                <Checkbox
                  id={`keyword-${keyword.keyword}`}
                  checked={keyword.enabled}
                  onCheckedChange={() => onKeywordToggle(keyword.keyword)}
                />
                <label
                  htmlFor={`keyword-${keyword.keyword}`}
                  className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                >
                  <span className="font-medium">{keyword.keyword}</span>
                  <Badge variant="outline" className="ml-2">
                    {keyword.interventionCount}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
