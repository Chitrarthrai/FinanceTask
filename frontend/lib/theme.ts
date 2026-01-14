/**
 * Theme Helper
 * Allows accessing the computed CSS variables programmatically.
 * Useful for Recharts or other libraries that don't support CSS classes directly.
 */

// Mapping of semantic color names to their CSS variable keys
export const THEME_VARS = {
  brand: {
    500: "--color-brand-500",
    600: "--color-brand-600",
  },
  text: {
    primary: "--text-primary",
    secondary: "--text-secondary",
    muted: "--text-muted",
    inverted: "--text-inverted",
  },
  bg: {
    primary: "--bg-primary",
    secondary: "--bg-secondary",
    tertiary: "--bg-tertiary",
  },
  border: {
    primary: "--border-primary",
  },
  chart: {
    1: "--chart-1",
    2: "--chart-2",
    3: "--chart-3",
    4: "--chart-4",
    5: "--chart-5",
  },
} as const;

/**
 * Gets the resolved CSS variable value from the document root.
 */
export const getThemeColor = (variableName: string): string => {
  if (typeof window === "undefined") return "";
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(variableName).trim();
};

/**
 * Hook to get current theme colors.
 * Since variables change with class changes (dark mode), we can simple read them.
 * However, we need to know when to re-read them.
 */
import { useEffect, useState } from "react";

export const useThemeColors = () => {
  // We'll trust that the CSS variables update automatically.
  // However, if we need the *values* in JS, we need to read them.
  // A mutation observer on the <html> class attribute is the best way to detect dark mode toggles.

  const [colors, setColors] = useState({
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8",
    brand: "#f97316",
    chart1: "#f97316",
    chart2: "#14b8a6",
    chart3: "#3b82f6",
    chart4: "#f43f5e",
    chart5: "#8b5cf6",
  });

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.body);
      setColors({
        primary: style.getPropertyValue("--text-primary").trim() || "#0f172a",
        secondary:
          style.getPropertyValue("--text-secondary").trim() || "#475569",
        muted: style.getPropertyValue("--text-muted").trim() || "#94a3b8",
        brand: style.getPropertyValue("--color-brand-500").trim() || "#f97316",
        chart1: style.getPropertyValue("--chart-1").trim() || "#f97316",
        chart2: style.getPropertyValue("--chart-2").trim() || "#14b8a6",
        chart3: style.getPropertyValue("--chart-3").trim() || "#3b82f6",
        chart4: style.getPropertyValue("--chart-4").trim() || "#f43f5e",
        chart5: style.getPropertyValue("--chart-5").trim() || "#8b5cf6",
      });
    };

    // Initial load
    // Small timeout to ensure DOM is ready and styles applied
    setTimeout(updateColors, 50);

    // Observer for class changes on <html> (dark mode toggle)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
};
