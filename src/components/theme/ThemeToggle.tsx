"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-0.5 rounded-full border bg-muted p-1">
      <button
        aria-label="Light mode"
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
          theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        <Sun size={15} />
      </button>
      <button
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
          theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        <Moon size={15} />
      </button>
    </div>
  );
}
