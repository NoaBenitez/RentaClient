import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ClientSelectorProps {
  clients: string[];
  selectedClient: string;
  onClientChange: (client: string) => void;
}

export const ClientSelector = ({ clients, selectedClient, onClientChange }: ClientSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="client-select">Client</Label>
      <Select value={selectedClient} onValueChange={onClientChange}>
        <SelectTrigger id="client-select" className="w-full">
          <SelectValue placeholder="Sélectionnez un client" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {clients.map((client) => (
            <SelectItem key={client} value={client}>
              {client}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
