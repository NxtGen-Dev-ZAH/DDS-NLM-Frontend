"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Ban,
  Unlock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { logsApi, incidentsApi, dashboardApi } from "@/lib/api";

interface DashboardStats {
  totalLogs: number;
  anomalies: number;
  blockedIPs: number;
  unblockedIPs: number;
}

// Default stats while loading
const defaultStats: DashboardStats = {
  totalLogs: 0,
  anomalies: 0,
  blockedIPs: 0,
  unblockedIPs: 0,
};

// Shared styling
const cardStyle = "bg-card border rounded-xl px-2 py-1.5 h-16 shadow-sm";

function StatCard({
  title,
  value,
  icon,
  iconColor,
  delta,
  deltaType,
}: {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  iconColor: string;
  delta: string;
  deltaType: "up" | "down";
}) {
  return (
    <Card className={cardStyle}>
      <div className="flex flex-col justify-between h-full">
        {/* Top: Title + Icon */}
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="truncate">{title}</span>
          <div className={cn("h-3 w-3 flex-shrink-0, pr-6", iconColor)}>
            {icon}
          </div>
        </div>

        {/* Middle: Value */}
        <div className="text-sm font-bold text-foreground leading-none">
          {value}
        </div>

        {/* Bottom: Delta */}
        <p className="text-[8px] text-muted-foreground leading-none flex items-center">
          {deltaType === "up" ? (
            <TrendingUp className="inline h-2 w-2 mr-1" />
          ) : (
            <TrendingDown className="inline h-2 w-2 mr-1" />
          )}
          {delta}
        </p>
      </div>
    </Card>
  );
}

// Custom hook to fetch dashboard stats
function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch data from multiple endpoints
        const [logsResponse, anomaliesResponse, incidentsResponse] =
          await Promise.all([
            logsApi.getLogs({ limit: 1000 }), // Get more logs for accurate count
            logsApi.getRecentAnomalies(50),
            incidentsApi.getCriticalIncidents(),
          ]);

        // Calculate stats from API responses
        const newStats: DashboardStats = {
          totalLogs: logsResponse.data.length,
          anomalies: anomaliesResponse.data.length,
          blockedIPs: 0, // This would need a specific endpoint or calculation
          unblockedIPs: 0, // This would need a specific endpoint or calculation
        };

        setStats(newStats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics");
        // Keep default stats on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, error };
}

// Individual stat cards
export function TotalLogsCard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <StatCard
      title="Total Logs"
      value={isLoading ? "..." : stats.totalLogs.toLocaleString()}
      icon={<FileText />}
      iconColor="text-blue-500"
      delta="+101"
      deltaType="up"
    />
  );
}

export function AnomaliesCard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <StatCard
      title="Anomalies"
      value={isLoading ? "..." : stats.anomalies}
      icon={<AlertTriangle />}
      iconColor="text-orange-500"
      delta="+24"
      deltaType="up"
    />
  );
}

export function BlockedIPsCard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <StatCard
      title="Blocked IPs"
      value={isLoading ? "..." : stats.blockedIPs}
      icon={<Ban />}
      iconColor="text-red-500"
      delta="+10"
      deltaType="up"
    />
  );
}

export function UnblockedIPsCard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <StatCard
      title="Unblocked IPs"
      value={isLoading ? "..." : stats.unblockedIPs.toString().padStart(2, "0")}
      icon={<Unlock />}
      iconColor="text-green-500"
      delta="-1"
      deltaType="down"
    />
  );
}

export function StatsCards({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      <TotalLogsCard />
      <AnomaliesCard />
      <BlockedIPsCard />
      <UnblockedIPsCard />
    </div>
  );
}
