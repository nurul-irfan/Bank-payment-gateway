import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentExecutions } from "@/components/dashboard/RecentExecutions";
import { ApprovalQueueWidget } from "@/components/dashboard/ApprovalQueueWidget";
import { mockExecutions, mockStats } from "@/lib/mock-data";
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  CheckCircle2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Bank to Crypto Execution Overview"
    >
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back. Here's what's happening with your executions.
          </p>
        </div>
        <Button variant="gold" size="default" className="w-full sm:w-auto" onClick={() => navigate('/new-execution')}>
          <Plus className="w-5 h-5 mr-2" />
          New Execution
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Executions"
          value={mockStats.totalExecutions}
          subtitle="All time transactions"
          icon={TrendingUp}
          trend={{ value: 12.5, isPositive: true }}
          index={0}
        />
        <StatsCard
          title="Pending Approvals"
          value={mockStats.pendingApprovals}
          subtitle="Awaiting review"
          icon={Clock}
          variant="primary"
          index={1}
        />
        <StatsCard
          title="Total Volume"
          value={formatCurrency(mockStats.totalVolume)}
          subtitle="Lifetime processed"
          icon={Wallet}
          trend={{ value: 8.2, isPositive: true }}
          index={2}
        />
        <StatsCard
          title="Settled Today"
          value={formatCurrency(mockStats.settledToday)}
          subtitle="Successfully completed"
          icon={CheckCircle2}
          variant="gold"
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentExecutions executions={mockExecutions} />
        </div>
        <div>
          <ApprovalQueueWidget executions={mockExecutions} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
