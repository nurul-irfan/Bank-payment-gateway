import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, User, Clock, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const mockAuditLogs = [
  {
    id: 'LOG-001',
    action: 'EXECUTION_CREATED',
    actor: 'Ahmed Al Mansouri',
    entityId: 'EX-2024-001',
    details: 'Created execution request for €500,000',
    timestamp: '2024-12-21T10:30:00Z',
  },
  {
    id: 'LOG-002',
    action: 'APPROVAL_GRANTED',
    actor: 'Sarah Johnson',
    entityId: 'EX-2024-002',
    details: 'Approved execution request',
    timestamp: '2024-12-20T16:00:00Z',
  },
  {
    id: 'LOG-003',
    action: 'APPROVAL_GRANTED',
    actor: 'Michael Chen',
    entityId: 'EX-2024-002',
    details: 'Approved execution request (dual approval complete)',
    timestamp: '2024-12-21T09:00:00Z',
  },
  {
    id: 'LOG-004',
    action: 'FIAT_CONFIRMED',
    actor: 'System',
    entityId: 'EX-2024-003',
    details: 'Fiat deposit confirmed via Binance',
    timestamp: '2024-12-20T16:30:00Z',
  },
  {
    id: 'LOG-005',
    action: 'CONVERSION_EXECUTED',
    actor: 'System',
    entityId: 'EX-2024-004',
    details: 'USDT conversion completed at rate 1.0812',
    timestamp: '2024-12-19T14:45:00Z',
  },
  {
    id: 'LOG-006',
    action: 'SETTLEMENT_COMPLETE',
    actor: 'System',
    entityId: 'EX-2024-005',
    details: 'Withdrawal to core wallet complete. TxHash: 0x742d...',
    timestamp: '2024-12-17T18:00:00Z',
  },
];

const actionColors: Record<string, string> = {
  EXECUTION_CREATED: 'bg-info/10 text-info',
  APPROVAL_GRANTED: 'bg-success/10 text-success',
  APPROVAL_REJECTED: 'bg-destructive/10 text-destructive',
  FIAT_CONFIRMED: 'bg-accent/10 text-accent',
  CONVERSION_EXECUTED: 'bg-primary/10 text-primary',
  SETTLEMENT_COMPLETE: 'bg-success/10 text-success',
};

const AuditLogs = () => {
  return (
    <DashboardLayout 
      title="Audit Logs" 
      subtitle="Complete activity history for compliance"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Logs List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {mockAuditLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {log.entityId}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">{log.details}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AuditLogs;
