"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  UserCog,
  ArrowLeftRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Ministry Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/analytics",
    label: "Teacher Analytics",
    icon: BarChart3,
  },
  {
    href: "/cadre",
    label: "Cadre",
    icon: Building2,
  },
  {
    href: "/retirement",
    label: "Retirement",
    icon: UserCog,
  },
  {
    href: "/transfers",
    label: "Transfer Applications",
    icon: ArrowLeftRight,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r bg-card">
      {/* Ministry Header */}
      <div className="border-b px-4 py-5">
        <div className="flex items-center gap-3">
          {/* Sri Lanka National Emblem */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Image
              src="/images/Emblem_of_Sri_Lanka.svg"
              alt="Sri Lanka National Emblem"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>

          {/* Ministry Names */}
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold leading-tight text-foreground">
              Ministry of Education
            </div>

            <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">
              අධ්‍යාපන අමාත්‍යාංශය
            </div>

            <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">
              கல்வி அமைச்சு
            </div>

            <div className="mt-1 text-[10.5px] text-muted-foreground">
              Sri Lanka
            </div>
          </div>
        </div>

        {/* Reporting System Label */}
        <div className="mt-4 border-t pt-3">
          <div className="text-[11.5px] font-medium text-muted-foreground">
            Teacher Administration · Reporting
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
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
    </aside>
  );
}
