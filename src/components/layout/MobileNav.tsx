"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navLinks } from "./Sidebar";

/**
 * Mobile navigation — hamburger button (below `lg`) that opens the same
 * sidebar navigation as a slide-in sheet. Closes on route change, backdrop
 * click, the built-in ✕ button, or Escape (via the Sheet primitive).
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close the sheet whenever the user navigates.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden"
        >
          <Menu size={20} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="flex w-72 flex-col gap-0 p-0"
      >
        {/* Ministry header — same branding as the desktop sidebar */}
        <div className="border-b px-4 py-5">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Image
                src="/images/Emblem_of_Sri_Lanka.svg"
                alt="Sri Lanka National Emblem"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                priority
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="text-[12px] font-semibold leading-tight text-foreground">
                Ministry of Education, Sri Lanka
              </SheetTitle>
              <div className="text-[12px] font-semibold leading-tight text-foreground">
                අධ්‍යාපන අමාත්‍යාංශය, ශ්‍රී ලංකාව
              </div>
              <div className="text-[12px] font-semibold leading-tight text-foreground">
                கல்வி அமைச்சு, இலங்கை
              </div>
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="text-[11.5px] font-medium text-muted-foreground">
              Teacher Administration · Reporting
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 overflow-y-auto p-3">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon size={15} className="shrink-0 opacity-90" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
