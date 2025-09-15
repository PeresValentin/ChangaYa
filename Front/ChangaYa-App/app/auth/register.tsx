import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

import TextField from "../../components/forms/TextField";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function RegisterScreen() {
  const palette = theme.Colors.light;

  const handleRegister = () => {
    Alert.alert("Registro", "TODO: conectar con Supabase Auth");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Publicá o postuláte a changas en minutos
        </Text>

        <TextField placeholder="Nombre completo" />
        <TextField
          placeholder="Email o teléfono"
          inputMode="email"
          autoCapitalize="none"
        />
        <TextField placeholder="Contraseña" secureTextEntry />
        <TextField placeholder="Confirmar contraseña" secureTextEntry />

        <View style={styles.roleRow}>
          <Pressable style={[styles.role, styles.roleActive]}>
            <Text style={styles.roleTxt}>Contratante</Text>
          </Pressable>
          <Pressable style={styles.role}>
            <Text style={styles.roleTxt}>Trabajador</Text>
          </Pressable>
        </View>

        <View style={styles.termsRow}>
          <View style={styles.checkbox} />
          <Text style={styles.termsTxt}>
            Acepto los{" "}
            <Text style={styles.link}>Términos y Condiciones</Text>.
          </Text>
        </View>

        <PrimaryButton
          title="Registrarme"
          onPress={handleRegister}
          style={{ marginTop: theme.SPACING.md }}
        />

        <Text style={styles.footerTxt}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" style={styles.link}>
            Iniciar sesión
          </Link>
        </Text>
      </View>
    </View>
  );
}

const { Colors, RADIUS, SPACING, FONT } = theme;
const palette = Colors.light;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: FONT.xl,
    fontWeight: "800" as const,
    color: palette.text,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "center" as const,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  role: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center" as const,
  },
  roleActive: {
    borderColor: palette.tint,
    backgroundColor: palette.background,
  },
  roleTxt: {
    fontWeight: "600" as const,
    color: palette.text,
  },
  termsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: SPACING.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
  },
  termsTxt: {
    marginLeft: SPACING.sm,
    color: palette.muted,
    flex: 1,
    fontSize: FONT.sm,
  },
  footerTxt: {
    textAlign: "center" as const,
    color: palette.muted,
    marginTop: 12,
  },
  link: {
    color: palette.tint,
    fontWeight: "700" as const,
  },
});
