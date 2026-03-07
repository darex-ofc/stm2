import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings2, Save } from "lucide-react";

interface FeeStructure {
  [level: string]: { tuition: number; levy: number };
}

interface Props {
  feeStructure: FeeStructure;
  zigRate: number;
  onFeeStructureChange: (fs: FeeStructure) => void;
  onZigRateChange: (rate: number) => void;
}

const FeeStructureCard = ({ feeStructure, zigRate, onFeeStructureChange, onZigRateChange }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FeeStructure>(feeStructure);

  const handleSave = () => {
    onFeeStructureChange(draft);
    setEditing(false);
  };

  const levelLabels: Record<string, string> = {
    zjc: "ZJC",
    o_level: "O Level",
    a_level: "A Level",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Fee Structure (per term)</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => { if (editing) handleSave(); else { setDraft({ ...feeStructure }); setEditing(true); } }}>
          {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Settings2 className="w-4 h-4 mr-1" /> Edit</>}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(editing ? draft : feeStructure).map(([level, fees]) => {
            const total = fees.tuition + fees.levy;
            return (
              <div key={level} className="p-3 rounded-lg bg-muted space-y-2">
                <span className="font-semibold text-foreground">{levelLabels[level] || level}</span>
                {editing ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-16 text-muted-foreground">Tuition:</span>
                      <Input type="number" className="h-8 w-24" value={draft[level].tuition}
                        onChange={e => setDraft({ ...draft, [level]: { ...draft[level], tuition: Number(e.target.value) } })} />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-16 text-muted-foreground">Levy:</span>
                      <Input type="number" className="h-8 w-24" value={draft[level].levy}
                        onChange={e => setDraft({ ...draft, [level]: { ...draft[level], levy: Number(e.target.value) } })} />
                    </div>
                    <p className="text-xs text-muted-foreground">Total: ${draft[level].tuition + draft[level].levy}</p>
                  </div>
                ) : (
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-muted-foreground">Tuition: ${fees.tuition} | Levy: ${fees.levy}</p>
                    <p className="font-bold text-foreground">${total} USD</p>
                    <p className="text-xs text-muted-foreground">ZIG {(total * zigRate).toLocaleString()}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Exchange Rate: 1 USD =</span>
          <Input type="number" value={zigRate} onChange={e => onZigRateChange(Number(e.target.value) || 28.5)} className="w-24" />
          <span className="text-sm text-muted-foreground">ZIG</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeStructureCard;
