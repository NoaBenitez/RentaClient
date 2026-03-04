import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReferenceInputProps {
  reference: string;
  onReferenceChange: (reference: string) => void;
}

export const ReferenceInput = ({ reference, onReferenceChange }: ReferenceInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reference-input">Référence (optionnelle)</Label>
      <Input
        id="reference-input"
        type="text"
        value={reference}
        onChange={(e) => onReferenceChange(e.target.value)}
        placeholder="Ex: REF-2024-001"
        className="w-full"
      />
    </div>
  );
};
