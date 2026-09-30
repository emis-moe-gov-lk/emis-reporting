import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar title={title} meta={meta} />
        <main className="flex-1 px-7 py-6">{children}</main>
        <footer className="border-t px-7 py-4">
          <p className="text-center text-xs text-muted-foreground">
            Ministry of Education © 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
