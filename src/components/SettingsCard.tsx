import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Wrench, Car, Percent, Euro, Briefcase } from "lucide-react";

interface SettingsCardProps {
  // Labor settings
  includeLabor: boolean;
  onToggleLabor: (checked: boolean) => void;
  hourlyRate: number;
  onHourlyRateChange: (rate: number) => void;
  
  // Travel settings
  travelCost: number;
  onTravelCostChange: (value: number) => void;
  
  // Vehicle settings
  vehicleHours: number;
  onVehicleHoursChange: (value: number) => void;
  vehicleRate: number;
  onVehicleRateChange: (value: number) => void;
  
  // Fee rates
  financialFeeRate: number;
  onFinancialFeeRateChange: (value: number) => void;
  structureFeeRate: number;
  onStructureFeeRateChange: (value: number) => void;
}

export const SettingsCard = ({
  includeLabor,
  onToggleLabor,
  hourlyRate,
  onHourlyRateChange,
  travelCost,
  onTravelCostChange,
  vehicleHours,
  onVehicleHoursChange,
  vehicleRate,
  onVehicleRateChange,
  financialFeeRate,
  onFinancialFeeRateChange,
  structureFeeRate,
  onStructureFeeRateChange,
}: SettingsCardProps) => {
  const hourlyRateOptions = Array.from({ length: 501 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Paramètres des frais</h2>
          <p className="text-muted-foreground text-sm">Configurez les taux et frais pour le calcul de rentabilité</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Main d'œuvre */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-primary" />
              Main d'Œuvre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="labor-toggle" className="cursor-pointer text-sm">
                Inclure dans le calcul
              </Label>
              <Switch
                id="labor-toggle"
                checked={includeLabor}
                onCheckedChange={onToggleLabor}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly-rate" className="text-sm">Taux horaire</Label>
              <Select value={hourlyRate.toString()} onValueChange={(value) => onHourlyRateChange(Number(value))}>
                <SelectTrigger id="hourly-rate" className="h-12">
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
          </CardContent>
        </Card>

        {/* Frais déplacement */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-primary" />
              Frais de déplacement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="travel-cost" className="text-sm">Montant fixe</Label>
              <div className="relative">
                <Input
                  id="travel-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={travelCost || ""}
                  onChange={(e) => onTravelCostChange(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-12 pr-8"
                />
                <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frais véhicule */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="w-5 h-5 text-primary" />
              Frais véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-hours" className="text-sm">Heures</Label>
                <Input
                  id="vehicle-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={vehicleHours || ""}
                  onChange={(e) => onVehicleHoursChange(Number(e.target.value) || 0)}
                  className="h-12"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-rate" className="text-sm">Taux horaire</Label>
                <div className="relative">
                  <Input
                    id="vehicle-rate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={vehicleRate || ""}
                    onChange={(e) => onVehicleRateChange(Number(e.target.value) || 0)}
                    className="h-12 pr-12"
                    placeholder="5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€/h</span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total véhicule</span>
                <span className="text-lg font-bold text-primary">{(vehicleHours * vehicleRate).toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frais financier */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="w-5 h-5 text-primary" />
              Frais financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="financial-fee" className="text-sm">Pourcentage sur (articles + MO)</Label>
              <div className="relative">
                <Input
                  id="financial-fee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={financialFeeRate || ""}
                  onChange={(e) => onFinancialFeeRateChange(Number(e.target.value) || 0)}
                  className="h-12 pr-8"
                  placeholder="1"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frais structure */}
        <Card className="border-2 hover:border-primary/30 transition-colors md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="w-5 h-5 text-primary" />
              Frais de structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-2">
              <Label htmlFor="structure-fee" className="text-sm">Pourcentage sur (articles + MO)</Label>
              <div className="relative">
                <Input
                  id="structure-fee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={structureFeeRate || ""}
                  onChange={(e) => onStructureFeeRateChange(Number(e.target.value) || 0)}
                  className="h-12 pr-8"
                  placeholder="5"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
