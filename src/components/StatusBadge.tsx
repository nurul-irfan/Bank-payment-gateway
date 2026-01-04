import { cn } from "@/lib/utils";
import { ExecutionStatus } from "@/types/execution";

interface StatusBadgeProps {
  status: ExecutionStatus;
  className?: string;
}

const statusConfig: Record<ExecutionStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-info/15 text-info border-info/30',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  FIAT_RECEIVED: {
    label: 'Fiat Received',
    className: 'bg-accent/15 text-accent border-accent/30',
  },
  CONVERTED: {
    label: 'Converted',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  SETTLED: {
    label: 'Settled',
    className: 'bg-success/15 text-success border-success/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-soft" />
      {config.label}
    </span>
  );
}
