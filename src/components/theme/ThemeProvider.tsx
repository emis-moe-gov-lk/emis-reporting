"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || null;
    const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(preferred);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
