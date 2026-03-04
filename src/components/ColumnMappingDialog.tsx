import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ColumnMapping } from "@/utils/excelParser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  typePiece: "Type de pièce",
  numeroFacture: "N° Facture",
  indice: "Indice",
  codeArticle: "Code article",
  description: "Description",
  prixUnitaireHT: "Prix unitaire HT",
  quantite: "Quantité",
  montantTotalHT: "Montant total HT",
  familleArticle: "Famille article",
  typeAffaire: "Type affaire",
  numeroClient: "N° Client",
  nomClient: "Nom client",
  dateLivraison: "Date livraison",
  reference: "Référence",
};

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  sampleRows: any[][];
  mapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
}

export const ColumnMappingDialog = ({
  open,
  onOpenChange,
  headers,
  sampleRows,
  mapping,
  onConfirm,
}: ColumnMappingDialogProps) => {
  const [localMapping, setLocalMapping] = useState<ColumnMapping>(mapping);

  useEffect(() => {
    setLocalMapping(mapping);
  }, [mapping]);

  const handleFieldChange = (field: keyof ColumnMapping, value: string) => {
    setLocalMapping(prev => ({ ...prev, [field]: parseInt(value) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mapping des colonnes — Pièces Clients</DialogTitle>
          <p className="text-sm text-muted-foreground">
            L'IA a proposé un mapping. Corrigez si nécessaire puis validez.
          </p>
        </DialogHeader>

        {/* Preview of headers */}
        {sampleRows.length > 0 && (
          <div className="rounded-lg border overflow-x-auto mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((h, i) => (
                    <TableHead key={i} className="text-xs whitespace-nowrap px-2">
                      <span className="text-muted-foreground mr-1">[{i}]</span>{h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.slice(0, 2).map((row, ri) => (
                  <TableRow key={ri}>
                    {headers.map((_, ci) => (
                      <TableCell key={ci} className="text-xs px-2 py-1 whitespace-nowrap max-w-[120px] truncate">
                        {row[ci] != null ? String(row[ci]) : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Mapping selectors */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Label className="text-xs w-32 shrink-0 text-right">{FIELD_LABELS[field]}</Label>
              <Select
                value={String(localMapping[field])}
                onValueChange={(v) => handleFieldChange(field, v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="-1" className="text-xs text-muted-foreground">— Non utilisé —</SelectItem>
                  {headers.map((h, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      [{i}] {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={() => { onConfirm(localMapping); onOpenChange(false); }}>
            Valider et importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
