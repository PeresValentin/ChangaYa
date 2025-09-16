import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#353D2F",            // Black olive para texto principal
    background: "#E6FAFC",      // Azure como fondo claro
    tint: "#6BA368",            // Asparagus como acento
    icon: "#515B3A",            // Dark moss green para íconos
    tabIconDefault: "#A1F19D",  // Light green para tabs inactivos
    tabIconSelected: "#ebfaeaff", // Asparagus para tab activo
    white: "#FFFFFF",
    muted: "#6B7280",
    border: "#E5E7EB",
  },
  dark: {
    text: "#E6FAFC",            // Texto claro
    background: "#353D2F",      // Fondo oscuro (Black olive)
    tint: "#A1E99D",            // Light green como acento
    icon: "#6BA368",            // Asparagus para íconos
    tabIconDefault: "#515B3A",  // Dark moss green tabs inactivos
    tabIconSelected: "#A1E99D", // Light green tab activo
    white: "#FFFFFF",
    muted: "#9CA3AF",
    border: "#4B5563",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

const RADIUS = { sm: 8, md: 12, lg: 20 };
const SPACING = { xs: 4, sm: 8, md: 14, lg: 20 };
const FONT = { sm: 13, md: 15, lg: 18, xl: 24, xxl: 28 };

const theme = { Colors, Fonts, RADIUS, SPACING, FONT };

export default theme;
