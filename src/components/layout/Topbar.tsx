import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "./MobileNav";
import { UserChip } from "./UserChip";

export function Topbar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-4 py-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
          {meta && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{meta}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <UserChip />
      </div>
    </div>
  );
}
