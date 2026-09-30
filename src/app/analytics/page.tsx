import { AppShell } from "@/components/layout/AppShell";
import { TeacherAnalytics } from "@/components/features/analytics/TeacherAnalytics";

export default function AnalyticsPage() {
  return (
    <AppShell title="Teacher Analytics">
      <TeacherAnalytics />
    </AppShell>
  );
}
