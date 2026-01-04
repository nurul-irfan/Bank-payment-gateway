import { motion } from "framer-motion";
import { ExecutionRequest } from "@/types/execution";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface RecentExecutionsProps {
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

export function RecentExecutions({ executions }: RecentExecutionsProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-lg font-semibold">Recent Executions</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {executions.slice(0, 5).map((execution, index) => (
          <motion.div
            key={execution.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            className="px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/transactions/${execution.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {execution.id}
                  </span>
                  <StatusBadge status={execution.status} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(execution.fiatAmount, execution.fiatCurrency)}
                  </span>
                  <span>→</span>
                  <span>{execution.targetAsset}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
