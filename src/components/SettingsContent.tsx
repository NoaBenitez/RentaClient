import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Car, Percent, Briefcase } from "lucide-react";

interface SettingsContentProps {
  includeLabor: boolean;
  onToggleLabor: (checked: boolean) => void;
  hourlyRate: number;
  onHourlyRateChange: (rate: number) => void;
  travelCost: number;
  onTravelCostChange: (value: number) => void;
  vehicleHours: number;
  onVehicleHoursChange: (value: number) => void;
  vehicleRate: number;
  onVehicleRateChange: (value: number) => void;
  financialFeeRate: number;
  onFinancialFeeRateChange: (value: number) => void;
  structureFeeRate: number;
  onStructureFeeRateChange: (value: number) => void;
}

export const SettingsContent = ({
  includeLabor, onToggleLabor,
  hourlyRate, onHourlyRateChange,
  travelCost, onTravelCostChange,
  vehicleHours, onVehicleHoursChange,
  vehicleRate, onVehicleRateChange,
  financialFeeRate, onFinancialFeeRateChange,
  structureFeeRate, onStructureFeeRateChange,
}: SettingsContentProps) => {
  const hourlyRateOptions = Array.from({ length: 501 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Main d'œuvre */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Wrench className="w-4 h-4" />
          Main d'Œuvre
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="labor-toggle-sheet" className="text-xs">Inclure</Label>
          <Switch id="labor-toggle-sheet" checked={includeLabor} onCheckedChange={onToggleLabor} />
        </div>
        <Select value={hourlyRate.toString()} onValueChange={(value) => onHourlyRateChange(Number(value))}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hourlyRateOptions.map((rate) => (
              <SelectItem key={rate} value={rate.toString()}>
                {rate}€/h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frais déplacement */}
      <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Briefcase className="w-4 h-4 text-primary" />
          Déplacement
        </div>
        <div className="relative">
          <Input
            type="number" min="0" step="0.01"
            value={travelCost || ""}
            onChange={(e) => onTravelCostChange(Number(e.target.value) || 0)}
            placeholder="0.00" className="h-10 pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
        </div>
      </div>

      {/* Frais véhicule */}
      <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Car className="w-4 h-4 text-primary" />
          Véhicule
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Heures (auto)</Label>
            <Input
              type="number"
              value={vehicleHours || ""}
              readOnly
              className="h-10 bg-muted/60 cursor-default opacity-70"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">€/h</Label>
            <Input
              type="number" min="0" step="0.5"
              value={vehicleRate || ""}
              onChange={(e) => onVehicleRateChange(Number(e.target.value) || 0)}
              className="h-10"
            />
          </div>
        </div>
        <div className="text-sm font-semibold text-primary">
          Total: {(vehicleHours * vehicleRate).toFixed(2)}€
        </div>
      </div>

      {/* Frais financier */}
      <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Percent className="w-4 h-4 text-primary" />
          Frais financier
        </div>
        <div className="relative">
          <Input
            type="number" min="0" max="100" step="0.1"
            value={financialFeeRate || ""}
            onChange={(e) => onFinancialFeeRateChange(Number(e.target.value) || 0)}
            placeholder="1" className="h-10 pr-8"
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      {/* Frais structure */}
      <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Percent className="w-4 h-4 text-primary" />
          Frais structure
        </div>
        <div className="relative">
          <Input
            type="number" min="0" max="100" step="0.1"
            value={structureFeeRate || ""}
            onChange={(e) => onStructureFeeRateChange(Number(e.target.value) || 0)}
            placeholder="5" className="h-10 pr-8"
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
