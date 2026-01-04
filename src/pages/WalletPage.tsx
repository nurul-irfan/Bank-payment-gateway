import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Wallet, Copy, ExternalLink, Shield, TrendingUp, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CORE_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f7BBBB";

const WalletPage = () => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(CORE_WALLET);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard.",
    });
  };

  return (
    <DashboardLayout 
      title="Core Wallet" 
      subtitle="Settlement destination overview"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <Wallet className="w-full h-full" />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold">Core Settlement Wallet</h2>
                <p className="text-primary-foreground/80">ETH / EVM Compatible</p>
              </div>
            </div>

            <div className="bg-primary-foreground/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-primary-foreground/70 mb-2">Wallet Address</p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono flex-1 break-all">{CORE_WALLET}</code>
                <Button variant="glass" size="icon" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="icon" asChild>
                  <a 
                    href={`https://etherscan.io/address/${CORE_WALLET}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
              <Shield className="w-4 h-4" />
              <span>Audited & immutable destination address</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Received</span>
            </div>
            <p className="text-3xl font-heading font-bold">5,250,000</p>
            <p className="text-sm text-muted-foreground">USDT</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <span className="text-sm text-muted-foreground">Settlements</span>
            </div>
            <p className="text-3xl font-heading font-bold">23</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Network</span>
            </div>
            <p className="text-3xl font-heading font-bold">ETH</p>
            <p className="text-sm text-muted-foreground">Ethereum Mainnet</p>
          </motion.div>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-info/5 border border-info/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-2">Security Notice</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This core wallet address is audited and immutable. All USDT settlements from approved 
                execution requests are directed here automatically. The wallet address cannot be modified 
                through the platform interface. Any address changes require a formal security review process.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
