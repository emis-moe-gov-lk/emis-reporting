import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserChip } from "./UserChip";

export function Topbar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-7 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {meta && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{meta}</div>}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserChip />
      </div>
    </div>
  );
}
