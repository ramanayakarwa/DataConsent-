import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  Share2,
  XCircle,
  Lock,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useConsent } from "@/contexts/ConsentContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import AuthForm from "@/components/AuthForm";

const RECENT_ACTIVITY_LIMIT = 2;

type ConsentStatus = "active" | "expiring" | "expired" | "revoked";

const Dashboard = () => {
  const { consents = [], getActiveConsents } = useConsent();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm embedded />;
  }

  const toDate = (value: Date | string) =>
    value instanceof Date ? value : new Date(value);

  const activeCount = getActiveConsents().length;
  const expiredCount = consents.filter(c => c.status === "expired").length;
  const revokedCount = consents.filter(c => c.status === "revoked").length;

  const thisMonthCount = consents.filter(c => {
    const start = toDate(c.startTime);
    const now = new Date();
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: "Active Consents", value: activeCount, icon: Shield, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
    { label: "Expired Consents", value: expiredCount, icon: Clock, color: "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10" },
    { label: "Data Shared", value: thisMonthCount, icon: Share2, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" },
    { label: "Revoked Access", value: revokedCount, icon: XCircle, color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10" },
  ];

  const recentActivity = [...consents]
    .sort((a, b) => toDate(b.startTime).getTime() - toDate(a.startTime).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT);

  const getStatusBadge = (status: ConsentStatus) => {
    const styles: Record<ConsentStatus, string> = {
      active: "status-active",
      expiring: "status-expiring",
      expired: "status-expired",
      revoked: "status-revoked",
    };

    const labels: Record<ConsentStatus, string> = {
      active: "Active",
      expiring: "Expiring Soon",
      expired: "Expired",
      revoked: "Revoked",
    };

    return (
      <Badge variant="outline" className={cn("font-medium", styles[status])}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] ?? "User"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your data sharing overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link to="/ledger" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No activity yet. Share some data to get started.
                  </div>
                ) : (
                  recentActivity.map(consent => (
                    <div
                      key={consent.id}
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {consent.dataType} shared with {consent.organization}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {consent.status === "active" || consent.status === "expiring" ? (
                              <>Expires {formatDistanceToNow(toDate(consent.expiryTime), { addSuffix: true })}</>
                            ) : (
                              <>
                                {consent.status === "revoked" ? "Revoked" : "Expired"}{" "}
                                {formatDistanceToNow(toDate(consent.expiryTime), { addSuffix: true })}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(consent.status)}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Indicators */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">End-to-End Encrypted</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All your personal data is encrypted at rest and in transit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Zero Data on Blockchain</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Only consent hashes are stored on-chain, never personal data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
