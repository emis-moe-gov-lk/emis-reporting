"use client";

import { User, LogOut, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserChip({ name = "A. Perera", role = "Ministry Admin" }: { name?: string; role?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-[13px] font-semibold leading-tight text-foreground">{name}</div>
          <div className="text-[11px] leading-tight text-muted-foreground">{role}</div>
        </div>
        <ChevronDown size={14} className="hidden text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs font-normal text-muted-foreground">{role}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
