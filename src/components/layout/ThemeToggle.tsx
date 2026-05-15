"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center transition-all duration-300 text-muted-foreground hover:bg-muted hover:text-foreground group border border-border/5",
        showLabel ? "w-full gap-4 px-4 py-3.5 rounded-2xl" : "justify-center w-10 h-10 rounded-xl"
      )}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <Sun className={cn(
          "w-5 h-5 absolute transition-all duration-500",
          theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )} />
        <Moon className={cn(
          "w-5 h-5 absolute transition-all duration-500",
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        )} />
      </div>
      {showLabel && (
        <span className="font-bold text-sm tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
