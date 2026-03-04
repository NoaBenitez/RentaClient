import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Euro } from "lucide-react";

interface LaborCardProps {
  includeLabor: boolean;
  laborCost: number;
  onToggle: (checked: boolean) => void;
  hourlyRate: number;
  onHourlyRateChange: (rate: number) => void;
}

export const LaborCard = ({ includeLabor, laborCost, onToggle, hourlyRate, onHourlyRateChange }: LaborCardProps) => {
  const hourlyRateOptions = Array.from({ length: 501 }, (_, i) => i);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Main d'Œuvre
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <Label htmlFor="labor-toggle" className="cursor-pointer">
              Inclure la main d'œuvre dans le calcul
            </Label>
            <Switch
              id="labor-toggle"
              checked={includeLabor}
              onCheckedChange={onToggle}
            />
          </div>

          <div className="p-4 rounded-lg border space-y-2">
            <Label htmlFor="hourly-rate">Taux horaire (€/h)</Label>
            <Select value={hourlyRate.toString()} onValueChange={(value) => onHourlyRateChange(Number(value))}>
              <SelectTrigger id="hourly-rate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourlyRateOptions.map((rate) => (
                  <SelectItem key={rate} value={rate.toString()}>
                    {rate}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {includeLabor && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Montant Main d'Œuvre</span>
              </div>
              <span className="text-2xl font-bold text-secondary">{laborCost.toFixed(2)}€</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
