import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import theme from "../../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function PrimaryButton({ title, onPress, style, disabled }: Props) {
  const palette = theme.Colors.light; // usamos la paleta clara por defecto

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn(palette),
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={styles.txt(palette)}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = {
  btn: (palette: any) =>
    StyleSheet.create({
      btn: {
        backgroundColor: palette.tint,
        paddingVertical: theme.SPACING.md,
        borderRadius: theme.RADIUS.md,
        alignItems: "center" as const, // 👈 fix TS
      },
    }).btn,

  txt: (palette: any) =>
    StyleSheet.create({
      txt: {
        color: palette.white,
        fontWeight: 700, // 👈 fix TS
        fontSize: theme.FONT.md,
        letterSpacing: 0.3,
        fontFamily: theme.Fonts?.sans,
      },
    }).txt,
};
