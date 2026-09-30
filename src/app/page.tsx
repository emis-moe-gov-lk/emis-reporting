import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, UserCog, TrendingUp } from "lucide-react";

const kpis = [
  {
    icon: Users,
    value: "231,480",
    label: "Total teachers (island-wide)",
    delta: "▲ 0.6% vs last term",
    positive: true,
  },
  {
    icon: CheckCircle2,
    value: "94.2%",
    label: "Approved cadre filled",
    delta: null,
    positive: true,
  },
  {
    icon: Clock,
    value: "4,912",
    label: "Open transfer applications",
    delta: "▲ 312 this month",
    positive: false,
  },
  {
    icon: UserCog,
    value: "1,140",
    label: "Teachers reaching 55 this year",
    delta: null,
    positive: true,
  },
];

export default function OverviewPage() {
  return (
    <AppShell title="Ministry Overview" meta="All provinces">
      {/* KPI cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, value, label, delta, positive }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                {delta && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      positive ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <TrendingUp size={12} />
                    {delta}
                  </span>
                )}
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                {value}
              </div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module summary */}
      <Card>
        <CardHeader>
          <CardTitle>What this module covers</CardTitle>
          <CardDescription>
            Reporting views available in the Teacher Administration module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border bg-muted/40 p-4">
              <dt className="text-sm font-semibold text-foreground">Teacher Analytics</dt>
              <dd className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Individual teacher listing, drilled by geography, with subject, gender,
                category, medium and service-years as columns.
              </dd>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <dt className="text-sm font-semibold text-foreground">Cadre</dt>
              <dd className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Cadre vs filled posts, vacancy ageing, surplus &amp; deficit, and
                teacher–student ratio.
              </dd>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <dt className="text-sm font-semibold text-foreground">Retirement</dt>
              <dd className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Teachers approaching retirement, grouped by 5-year service bands.
              </dd>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <dt className="text-sm font-semibold text-foreground">Transfer Applications</dt>
              <dd className="mt-1 text-[13px] leading-6 text-muted-foreground">
                Inter-Zonal, Another Zonal and Inter-Provincial requests with full service
                history and downloadable reports.
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </AppShell>
  );
}
