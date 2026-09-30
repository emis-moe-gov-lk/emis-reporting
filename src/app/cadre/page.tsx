import { AppShell } from "@/components/layout/AppShell";
import { CadreTabs } from "@/components/features/cadre/CadreTabs";

export default function CadrePage() {
  return (
    <AppShell title="Cadre">
      <CadreTabs />
    </AppShell>
  );
}
