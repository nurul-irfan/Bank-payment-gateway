import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockExecutions } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Check, X, User, Clock, DollarSign, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Approvals = () => {
  const { toast } = useToast();
  const pendingApprovals = mockExecutions.filter(e => e.status === 'PENDING_APPROVAL');

  const handleApprove = (id: string) => {
    toast({
      title: "Request Approved",
      description: `Execution ${id} has been approved.`,
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Request Rejected", 
      description: `Execution ${id} has been rejected.`,
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout 
      title="Approval Queue" 
      subtitle="Review and approve pending execution requests"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-warning/10 rounded-xl border border-warning/20">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Each request requires dual approval before execution
            </p>
          </div>
        </div>

        {/* Approval Cards */}
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-12 text-center"
            >
              <Check className="w-16 h-16 mx-auto text-success/50 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending approvals at this time.</p>
            </motion.div>
          ) : (
            pendingApprovals.map((execution, index) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-mono text-base sm:text-lg font-semibold text-foreground">
                          {execution.id}
                        </span>
                        <StatusBadge status={execution.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {execution.initiatorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>

                  {/* Amount Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Fiat Amount</p>
                      <p className="text-xl sm:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-accent" />
                        {formatCurrency(execution.fiatAmount, execution.fiatCurrency)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Target Asset</p>
                      <p className="text-xl sm:text-2xl font-heading font-bold text-primary">
                        {execution.targetAsset}
                      </p>
                      <p className="text-xs text-muted-foreground">ERC-20</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 sm:col-span-2 lg:col-span-1">
                      <p className="text-sm text-muted-foreground mb-1">Reference</p>
                      <p className="font-mono text-sm text-foreground break-all">
                        {execution.internalReference || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {execution.notes && (
                    <div className="bg-info/5 border border-info/20 rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium text-info mb-1">Notes from Initiator</p>
                      <p className="text-sm text-foreground">{execution.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 border-t border-border">
                    <Button 
                      variant="success" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => handleApprove(execution.id)}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Approve Request
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => handleReject(execution.id)}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
