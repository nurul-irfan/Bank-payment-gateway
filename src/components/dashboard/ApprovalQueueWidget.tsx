import { motion } from "framer-motion";
import { ExecutionRequest } from "@/types/execution";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApprovalQueueWidgetProps {
  executions: ExecutionRequest[];
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function ApprovalQueueWidget({ executions }: ApprovalQueueWidgetProps) {
  const pendingApprovals = executions.filter(e => e.status === 'PENDING_APPROVAL');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border bg-warning/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold">Pending Approvals</h2>
            <p className="text-sm text-muted-foreground">
              {pendingApprovals.length} requests awaiting approval
            </p>
          </div>
        </div>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Check className="w-12 h-12 mx-auto text-success/50 mb-3" />
          <p className="text-muted-foreground">No pending approvals</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {pendingApprovals.map((execution, index) => (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              className="px-6 py-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {execution.id}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      {execution.initiatorName}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <StatusBadge status={execution.status} />
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {formatCurrency(execution.fiatAmount, execution.fiatCurrency)}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium text-primary">{execution.targetAsset}</span>
              </div>

              {execution.notes && (
                <p className="text-sm text-muted-foreground mb-4 bg-muted/50 px-3 py-2 rounded-lg">
                  {execution.notes}
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="success" size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
