import { View, TextInput, StyleSheet, TextInputProps, Text } from "react-native";
import theme from "../../constants/theme";

type Props = TextInputProps & {
  error?: string; // opcional, para mostrar error de validación
};

export default function TextField({ error, style, ...props }: Props) {
  const palette = theme.Colors.light;

  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor={palette.muted}
        style={[styles.input(palette), style]}
        {...props}
      />
      {error ? <Text style={styles.error(palette)}>{error}</Text> : null}
    </View>
  );
}

const styles = {
  container: StyleSheet.create({
    base: { marginVertical: theme.SPACING.sm },
  }).base,

  input: (palette: any) =>
    StyleSheet.create({
      input: {
        backgroundColor: palette.background,
        borderRadius: theme.RADIUS.md,
        paddingHorizontal: theme.SPACING.md,
        paddingVertical: 12,
        fontSize: theme.FONT.md,
        color: palette.text,
        borderWidth: 1,
        borderColor: palette.border,
      },
    }).input,

  error: (palette: any) =>
    StyleSheet.create({
      error: {
        marginTop: 4,
        color: palette.icon,
        fontSize: theme.FONT.sm,
      },
    }).error,
};
