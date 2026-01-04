import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  DollarSign, 
  Wallet, 
  FileText,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CORE_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f7BBBB";

const NewExecution = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fiatAmount: "",
    fiatCurrency: "EUR",
    binanceAccountRef: "",
    internalReference: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fiatAmount || !formData.binanceAccountRef) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Execution Request Created",
      description: "Your request has been submitted for approval.",
    });

    navigate('/');
  };

  const estimatedUsdt = formData.fiatAmount 
    ? (parseFloat(formData.fiatAmount) * (formData.fiatCurrency === 'EUR' ? 1.08 : 1)).toFixed(2)
    : "0.00";

  return (
    <DashboardLayout 
      title="New Execution Request" 
      subtitle="Create a new fiat to crypto execution"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Info Banner */}
          <div className="bg-info/10 border-b border-info/20 px-6 py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium text-info">Dual Approval Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This execution request will require approval from at least two authorized approvers before processing.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Amount Section */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Amount Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiatAmount">Fiat Amount *</Label>
                  <Input
                    id="fiatAmount"
                    type="number"
                    placeholder="500,000"
                    value={formData.fiatAmount}
                    onChange={(e) => setFormData({ ...formData, fiatAmount: e.target.value })}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiatCurrency">Currency *</Label>
                  <Select 
                    value={formData.fiatCurrency} 
                    onValueChange={(value) => setFormData({ ...formData, fiatCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conversion Preview */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Output</p>
                    <p className="text-2xl font-heading font-bold text-primary">
                      {parseFloat(estimatedUsdt).toLocaleString()} USDT
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Target Asset</p>
                      <p className="font-semibold">USDT (ERC-20)</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Account Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binanceAccountRef">Binance Account Reference *</Label>
                  <Input
                    id="binanceAccountRef"
                    placeholder="BN-CORP-001"
                    value={formData.binanceAccountRef}
                    onChange={(e) => setFormData({ ...formData, binanceAccountRef: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Core Wallet Destination</Label>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <code className="text-sm font-mono text-foreground">{CORE_WALLET}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Read-only. All settlements are directed to the audited core wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference & Notes */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Reference & Notes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="internalReference">Internal Reference</Label>
                  <Input
                    id="internalReference"
                    placeholder="TREAS-2024-Q4-001"
                    value={formData.internalReference}
                    onChange={(e) => setFormData({ ...formData, internalReference: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional context for approvers..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="lg">
                Submit for Approval
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NewExecution;
