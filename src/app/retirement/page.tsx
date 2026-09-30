import { AppShell } from "@/components/layout/AppShell";
import { RetirementReport } from "@/components/features/retirement/RetirementReport";

export default function RetirementPage() {
  return (
    <AppShell title="Retirement">
      <RetirementReport />
    </AppShell>
  );
}
