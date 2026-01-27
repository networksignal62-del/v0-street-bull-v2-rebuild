import { StatCard } from "@/components/dashboard/stat-card";
import { PositionChart, StatusChart } from "@/components/dashboard/charts";
import { RecentPlayers } from "@/components/dashboard/recent-players";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Players"
          value="500"
          iconName="users"
          trend={{ value: 12, isPositive: true }}
          description="Registered players"
        />
        <StatCard
          title="Total Agents"
          value="52"
          iconName="userCheck"
          trend={{ value: 8, isPositive: true }}
          description="Active agents"
        />
        <StatCard
          title="Pending Approvals"
          value="15"
          iconName="clipboardList"
          trend={{ value: 5, isPositive: false }}
          description="Awaiting review"
        />
        <StatCard
          title="Active Streams"
          value="3"
          iconName="radio"
          trend={{ value: 50, isPositive: true }}
          description="Live now"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PositionChart />
        <StatusChart />
      </div>

      {/* Table and Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentPlayers />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
