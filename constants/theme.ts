import { Platform } from "react-native";

// Brand palette - Sky/Cyan/Teal theme matching web app
export const Palette = {
  primary: "#0EA5E9", // sky-500
  primaryLight: "#38BDF8", // sky-400
  primaryDark: "#0284C7", // sky-600
  secondary: "#06B6D4", // cyan-500
  secondaryLight: "#22D3EE", // cyan-400
  secondaryDark: "#0891B2", // cyan-600
  accent: "#14B8A6", // teal-500
  accentLight: "#2DD4BF", // teal-400
  accentDark: "#0D9488", // teal-600
  income: "#22C55E",
  expense: "#EF4444",
  investment: "#3B82F6",
  savings: "#F59E0B",
  incomeDark: "#4ADE80",
  expenseDark: "#F87171",
  investmentDark: "#60A5FA",
  savingsDark: "#FCD34D",
};

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#64748B",
    background: "#F1F5F9",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    primary: Palette.primary, // sky-500
    secondary: Palette.secondary, // cyan-500
    accent: Palette.accent, // teal-500
    tint: Palette.primary,
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: Palette.primary,
    income: Palette.income,
    expense: Palette.expense,
    investment: Palette.investment,
    savings: Palette.savings,
    card: "#FFFFFF",
    error: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    background: "#0A0A1A",
    surface: "#14142B",
    border: "#1E1E3F",
    primary: Palette.primaryLight, // sky-400
    secondary: Palette.secondaryLight, // cyan-400
    accent: Palette.accentLight, // teal-400
    tint: Palette.primaryLight,
    icon: "#94A3B8",
    tabIconDefault: "#475569",
   tabIconSelected: Palette.primaryLight,
    income: Palette.incomeDark,
    expense: Palette.expenseDark,
    investment: Palette.investmentDark,
    savings: Palette.savingsDark,
    card: "#14142B",
    error: "#F87171",
    success: "#4ADE80",
    warning: "#FCD34D",
    overlay: "rgba(0,0,0,0.6)",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Gradient combinations matching web app
export const Gradients = {
  primary: [Palette.primary, Palette.secondary], // sky-500 to cyan-500
  header: [Palette.primaryDark, Palette.secondaryDark, Palette.accentDark], // sky-600 via cyan-600 to teal-600
  card: [Palette.primaryLight, Palette.secondaryLight], // sky-400 to cyan-400
  button: [Palette.primary, Palette.secondary], // sky-500 to cyan-500
  accent: [Palette.secondary, Palette.accent], // cyan-500 to teal-500
  feature1: [Palette.primary, Palette.secondary], // sky-500 to cyan-500
  feature2: [Palette.secondary, Palette.accent], // cyan-500 to teal-500
  feature3: [Palette.accent, "#10B981"], // teal-500 to emerald-500
};
