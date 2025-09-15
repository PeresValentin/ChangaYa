import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

import TextField from "../../components/forms/TextField";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function LoginScreen() {
  const palette = theme.Colors.light;

  const handleLogin = () => {
    Alert.alert("Login", "TODO: conectar con Supabase Auth");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>Encuentra tu próxima changa</Text>

        <TextField
          placeholder="Email o teléfono"
          inputMode="email"
          autoCapitalize="none"
        />
        <TextField
          placeholder="Contraseña"
          secureTextEntry
        />

        <Pressable>
          <Text style={styles.linkMuted}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        <PrimaryButton
          title="INICIAR SESIÓN"
          onPress={handleLogin}
          style={{ marginTop: theme.SPACING.md }}
        />

        <Text style={styles.footerTxt}>
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" style={styles.link}>
            Regístrate
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "center",
    marginBottom: 12,
  },
  linkMuted: {
    color: palette.muted,
    textAlign: "right" as const,
    marginTop: 6,
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
