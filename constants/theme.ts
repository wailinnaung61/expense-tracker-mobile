import { Platform } from "react-native";

// Brand palette
export const Palette = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryDark: "#5B21B6",
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
