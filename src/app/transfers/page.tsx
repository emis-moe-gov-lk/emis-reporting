import { AppShell } from "@/components/layout/AppShell";
import { TransferApplications } from "@/components/features/transfers/TransferApplications";

export default function TransfersPage() {
  return (
    <AppShell title="Transfer Applications">
      <TransferApplications />
    </AppShell>
  );
}
